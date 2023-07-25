import { DateTime } from 'Money/DateTime';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { Trade } from 'Trading/Domain/Trade';

export class UnwindTrade {
  private tradesRepository: TradesRepository;
  private northCapitalAdapter: TradingNorthCapitalAdapter;

  constructor(tradesRepository: TradesRepository, northCapitalAdapter: TradingNorthCapitalAdapter) {
    this.tradesRepository = tradesRepository;
    this.northCapitalAdapter = northCapitalAdapter;
  }

  static getClassName = () => 'UnwindTrade';

  async execute(investmentId: string): Promise<{ event: 'Unwound' | 'Unwinding' | 'Failed'; reason?: string } | null> {
    try {
      const trade = await this.tradesRepository.getTradeByInvestmentId(investmentId);
      console.log(`Unwinding/Canceling trade: ${investmentId}}`);

      if (!trade) {
        return { event: 'Unwound' };
      }

      if (!trade.tradeExists()) {
        // trade not created, so actually no action to do, so just return true
        return { event: 'Unwound' };
      }

      if (trade.isCanceled()) {
        return { event: 'Unwound' };
      }

      const currentTradeState = await this.northCapitalAdapter.getTradeStatus(trade.getTradeId());

      if (currentTradeState.isSettled()) {
        // cannot cancel settled trade
        return { event: 'Failed', reason: 'Trade is already settled' };
      }

      if (trade.isTradeUnwinding()) {
        if (currentTradeState.isUnwindSettled()) {
          trade.setTradeUnwounded();
          await this.tradesRepository.updateTrade(trade);
          await this.sendCancelEvent(trade);

          return { event: 'Unwound' };
        }

        return null;
      }

      const email = trade.getInvestorEmail();
      const { details: cancelDetails } = await this.northCapitalAdapter.cancelTrade(
        trade.getTradeId(),
        email,
        'Investor Unwound trade before grace period ended',
      );
      const cancelStatus = await this.northCapitalAdapter.getTradeStatus(trade.getTradeId());
      trade.setTradeCancelState(cancelStatus.toString(), cancelDetails);
      await this.tradesRepository.updateTrade(trade);

      if (trade.isCanceled()) {
        await this.sendCancelEvent(trade);

        return { event: 'Unwound' };
      } else if (trade.isTradeUnwinding()) {
        return { event: 'Unwinding' };
      } else {
        return { event: 'Failed', reason: `Wrong trade state: ${cancelStatus}` };
      }
    } catch (error) {
      console.error(`[Trade ${investmentId}]`, 'Trade cancel process failed', error);

      return null;
    }
  }

  private async sendCancelEvent(trade: Trade) {
    const { amount, fee, userTradeId, investmentId } = trade.getFundsTransferConfiguration();

    await this.tradesRepository.publishEvent(
      storeEventCommand(trade.getProfileId(), 'TransactionCanceled', {
        accountId: trade.getReinvestAccountId(),
        investmentId,
        amount: amount.getAmount(),
        fee: fee.getAmount(),
        tradeId: userTradeId,
        date: DateTime.now().toIsoDateTime(),
      }),
    );
  }
}
