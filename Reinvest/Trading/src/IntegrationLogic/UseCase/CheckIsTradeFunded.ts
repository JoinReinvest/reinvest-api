import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { TradingVertaloAdapter } from 'Trading/Adapter/Vertalo/TradingVertaloAdapter';

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

  async execute(investmentId: string): Promise<boolean> {
    try {
      const trade = await this.tradesRepository.getTradeByInvestmentId(investmentId);

      if (!trade) {
        throw new Error(`Trade ${investmentId} is not awaiting funding`);
      }

      console.info(`[Trade ${investmentId}]`, 'Check is trade funded');

      if (trade.isTradeAwaitingFunding()) {
        const tradeId = trade.getTradeId();
        const tradeStatus = await this.northCapitalAdapter.getTradeStatus(tradeId);

        if (tradeStatus === 'funded') {
          trade.setTradeStatusToFunded();
          await this.tradesRepository.updateTrade(trade);
          console.info(`[Trade ${investmentId}]`, 'Trade is funded');
        } else {
          // TODO if trade is not funded, we should check the status of payment, as trade status is not changed if payment failed!!!
          console.info(`[Trade ${investmentId}]`, 'Trade is NOT funded yet:', tradeStatus);

          return false;
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

      return true;
    } catch (error) {
      console.error(`[Trade ${investmentId}]`, 'Trade funded process failed', error);

      return false;
    }
  }
}
