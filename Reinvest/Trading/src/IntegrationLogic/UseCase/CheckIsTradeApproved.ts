import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { TradeVerification } from 'Trading/Domain/TradeVerification';

export class CheckIsTradeApproved {
  private tradesRepository: TradesRepository;
  private northCapitalAdapter: TradingNorthCapitalAdapter;
  private eventBus: EventBus;

  constructor(tradesRepository: TradesRepository, northCapitalAdapter: TradingNorthCapitalAdapter, eventBus: EventBus) {
    this.tradesRepository = tradesRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.eventBus = eventBus;
  }

  static getClassName = () => 'CheckIsTradeApproved';

  async execute(investmentId: string): Promise<void> {
    try {
      const trade = await this.tradesRepository.getTradeByInvestmentId(investmentId);

      if (!trade) {
        throw new Error(`Trade ${investmentId} is not awaiting approval`);
      }

      // TODO RIA-236

      console.info(`[Trade ${investmentId}]`, 'Check is trade approved');

      if (trade.isTradeVerified()) {
        await this.eventBus.publish({
          kind: 'InvestmentApproved',
          id: investmentId,
        });

        return;
      }

      if (trade.isTradeRejected()) {
        await this.eventBus.publish({
          kind: 'InvestmentRejected',
          id: investmentId,
        });

        return;
      }

      const currentTradeVerification = await this.northCapitalAdapter.getTradeVerification(trade.getTradeId());

      const tradeVerification = new TradeVerification(trade.getTradeVerificationState());

      console.info(`[Trade ${investmentId}]`, '[MOCK] RR Approval is Approved');
    } catch (error) {
      console.error(`[Trade ${investmentId}]`, 'Trade approval process failed', error);
    }
  }
}
