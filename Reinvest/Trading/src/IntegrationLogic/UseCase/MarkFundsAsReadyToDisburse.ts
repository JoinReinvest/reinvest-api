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

      console.info(`[Trade ${investmentId}]`, 'Mark trade to be ready to disburse');

      if (!trade) {
        throw new Error(`Trade ${investmentId} not exists`);
      }

      if (trade.isMarkedReadyToDisbursement()) {
        return true;
      }

      await this.northCapitalAdapter.markTradeAsReadyToDisburse(trade.getTradeId());
      trade.setDisbursementStateAsMarked();
      await this.tradesRepository.updateTrade(trade);

      return true;
    } catch (error) {
      console.error(`[Trade ${investmentId}]`, 'Mark trade ready to be disburse', error);

      return false;
    }
  }
}
