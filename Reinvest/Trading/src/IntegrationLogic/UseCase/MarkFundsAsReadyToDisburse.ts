import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';

export class MarkFundsAsReadyToDisburse {
  private tradesRepository: TradesRepository;
  private northCapitalAdapter: TradingNorthCapitalAdapter;

  constructor(tradesRepository: TradesRepository, northCapitalAdapter: TradingNorthCapitalAdapter) {
    this.tradesRepository = tradesRepository;
    this.northCapitalAdapter = northCapitalAdapter;
  }

  static getClassName = () => 'MarkFundsAsReadyToDisburse';

  async execute(investmentId: string): Promise<boolean> {
    try {
      const trade = await this.tradesRepository.getTradeByInvestmentId(investmentId);

      if (!trade) {
        throw new Error(`Trade ${investmentId} is not awaiting funding`);
      }

      console.info(`[Trade ${investmentId}]`, 'Mark trade to be ready to disburse');

      return true;
    } catch (error) {
      console.error(`[Trade ${investmentId}]`, 'Mark trade ready to be disburse', error);

      return false;
    }
  }
}
