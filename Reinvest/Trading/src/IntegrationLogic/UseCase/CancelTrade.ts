import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';

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

      console.log('cancel trade');

      if (!trade) {
        throw new Error(`Trade ${investmentId} not exists`);
      }

      if (!trade.isTradeCreated()) {
        // trade not created, so actually no action to do, so just return true
        return;
      }

      if (trade.isCanceled()) {
        return;
      }

      const email = trade.getInvestorEmail();
      const currentTradeState = await this.northCapitalAdapter.getTradeStatus(trade.getTradeId());

      if (currentTradeState === 'created') {
        const cancelState = await this.northCapitalAdapter.cancelTrade(trade.getTradeId(), email, 'Investor canceled trade before grace period ended');
        trade.setTradeCancelState(cancelState);
        await this.tradesRepository.updateTrade(trade);

        return;
      }

      if (currentTradeState === 'funded') {
        const cancelState = await this.northCapitalAdapter.cancelTrade(trade.getTradeId(), email, 'Investor canceled trade before grace period ended');
        trade.setTradeCancelState(cancelState);
        await this.tradesRepository.updateTrade(trade);
        // TODO send proper events
        return;
      }

      if (currentTradeState === 'settled') {
        return;
      }
    } catch (error) {
      console.error(`[Trade ${investmentId}]`, 'Trade cancel process failed', error);
    }
  }
}
