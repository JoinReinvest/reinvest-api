import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';

export enum CancelTradeEvent {
  TransactionCanceled = 'TransactionCanceled',
  TransactionUnwinding = 'TransactionUnwinding',
  TransactionCanceledFailed = 'TransactionCanceledFailed',
}

export class CancelTrade {
  private tradesRepository: TradesRepository;
  private northCapitalAdapter: TradingNorthCapitalAdapter;
  private eventBus: EventBus;

  constructor(tradesRepository: TradesRepository, northCapitalAdapter: TradingNorthCapitalAdapter, eventBus: EventBus) {
    this.tradesRepository = tradesRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.eventBus = eventBus;
  }

  static getClassName = () => 'CancelTrade';

  async execute(investmentId: string): Promise<void> {
    try {
      const trade = await this.tradesRepository.getTradeByInvestmentId(investmentId);
      console.log(`Canceling trade: ${investmentId}}`);

      if (!trade) {
        throw new Error(`Trade ${investmentId} not exists`);
      }

      if (!trade.tradeExists()) {
        // trade not created, so actually no action to do, so just return true
        await this.eventBus.publish({
          kind: CancelTradeEvent.TransactionCanceled,
          id: investmentId,
        });

        return;
      }

      if (trade.isCanceled()) {
        await this.eventBus.publish({
          kind: CancelTradeEvent.TransactionCanceled,
          id: investmentId,
        });

        return;
      }

      const currentTradeState = await this.northCapitalAdapter.getTradeStatus(trade.getTradeId());

      if (currentTradeState.isSettled()) {
        // cannot cancel settled trade
        await this.eventBus.publish({
          kind: CancelTradeEvent.TransactionCanceledFailed,
          id: investmentId,
          data: {
            reason: 'Trade is already settled',
          },
        });

        return;
      }

      if (trade.isTradeUnwinding()) {
        if (currentTradeState.isUnwindSettled()) {
          trade.setTradeUnwounded();
          await this.tradesRepository.updateTrade(trade);
          await this.eventBus.publish({
            kind: CancelTradeEvent.TransactionCanceled,
            id: investmentId,
          });
        }

        return;
      }

      const email = trade.getInvestorEmail();
      const { status: cancelStatus, details: cancelDetails } = await this.northCapitalAdapter.cancelTrade(
        trade.getTradeId(),
        email,
        'Investor canceled trade before grace period ended',
      );
      trade.setTradeCancelState(cancelStatus, cancelDetails);
      await this.tradesRepository.updateTrade(trade);

      if (trade.isCanceled()) {
        await this.eventBus.publish({
          kind: CancelTradeEvent.TransactionCanceled,
          id: investmentId,
        });
      } else if (trade.isTradeUnwinding()) {
        await this.eventBus.publish({
          kind: CancelTradeEvent.TransactionUnwinding,
          id: investmentId,
        });
      } else {
        await this.eventBus.publish({
          kind: CancelTradeEvent.TransactionCanceledFailed,
          id: investmentId,
          data: {
            reason: `Wrong trade state: ${cancelStatus}`,
          },
        });
      }
    } catch (error) {
      console.error(`[Trade ${investmentId}]`, 'Trade cancel process failed', error);
    }
  }
}
