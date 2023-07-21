import { DateTime } from 'Money/DateTime';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { TradingVertaloAdapter } from 'Trading/Adapter/Vertalo/TradingVertaloAdapter';

export type PaymentTransferStatus = {
  status: 'failed' | 'second-fail' | 'pending' | 'success';
};

export class CheckIsTradeFunded {
  private tradesRepository: TradesRepository;
  private northCapitalAdapter: TradingNorthCapitalAdapter;
  private vertaloAdapter: TradingVertaloAdapter;

  constructor(tradesRepository: TradesRepository, northCapitalAdapter: TradingNorthCapitalAdapter, vertaloAdapter: TradingVertaloAdapter) {
    this.tradesRepository = tradesRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.vertaloAdapter = vertaloAdapter;
  }

  static getClassName = () => 'CheckIsTradeFunded';

  async execute(investmentId: string): Promise<PaymentTransferStatus> {
    try {
      const trade = await this.tradesRepository.getTradeByInvestmentId(investmentId);

      if (!trade) {
        throw new Error(`Trade ${investmentId} is not awaiting funding`);
      }

      console.info(`[Trade ${investmentId}]`, 'Check is trade funded');

      if (trade.isTradeAwaitingFunding()) {
        const tradeId = trade.getTradeId();
        const tradeStatus = await this.northCapitalAdapter.getTradeStatus(tradeId);

        if (tradeStatus.isFunded()) {
          trade.setTradeStatusToFunded();
          await this.tradesRepository.updateTrade(trade);
          console.info(`[Trade ${investmentId}]`, 'Trade is funded');

          const { amount, fee, userTradeId } = trade.getFundsTransferConfiguration();

          await this.tradesRepository.publishEvent(
            storeEventCommand(trade.getProfileId(), 'PaymentFinished', {
              accountId: trade.getReinvestAccountId(),
              investmentId,
              amount: amount.getAmount(),
              fee: fee.getAmount(),
              tradeId: userTradeId,
              date: DateTime.now().toIsoDateTime(),
            }),
          );
        } else {
          const paymentData = trade.getNorthCapitalPayment();

          if (!paymentData) {
            // no payment data, so we can't check payment status - it can happen if there was a bug and the transfer was initiated,
            // but payment data was not saved to the DB, and it retried, but NC returned info that it is already started
            return {
              status: 'pending',
            };
          }

          const { ncAccountId, paymentId } = paymentData;
          const paymentState = await this.northCapitalAdapter.getPaymentState(ncAccountId, paymentId);

          if (paymentState.isFailed()) {
            const { amount, fee, userTradeId } = trade.getFundsTransferConfiguration();

            await this.tradesRepository.publishEvent(
              storeEventCommand(trade.getProfileId(), 'PaymentFailed', {
                accountId: trade.getReinvestAccountId(),
                investmentId,
                amount: amount.getAmount(),
                fee: fee.getAmount(),
                tradeId: userTradeId,
                date: DateTime.now().toIsoDateTime(),
              }),
            );

            return {
              status: trade.isPaymentRetried() ? 'second-fail' : 'failed',
            };
          }

          console.info(
            `[Trade ${investmentId}]`,
            `Trade is NOT funded yet. Trade status: ${tradeStatus.toString()}, Payment status: ${paymentState.toString()}`,
          );

          return { status: 'pending' };
        }
      }

      if (trade.isVertaloDistributionOpened()) {
        const { distributionId } = trade.getVertaloDistribution();
        const isClosed = await this.vertaloAdapter.closeDistribution(distributionId);

        if (isClosed) {
          trade.updateVertaloDistributionStatus('closed');
          await this.tradesRepository.updateTrade(trade);
          console.info(`[Trade ${investmentId}]`, 'Vertalo distribution closed');
        } else {
          throw new Error('Vertalo distribution not closed');
        }
      }

      return { status: 'success' };
    } catch (error) {
      console.error(`[Trade ${investmentId}]`, 'Trade funded process failed', error);

      return { status: 'pending' };
    }
  }
}
