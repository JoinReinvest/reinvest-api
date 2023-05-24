import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { TradingVertaloAdapter } from 'Trading/Adapter/Vertalo/TradingVertaloAdapter';

export class TransferSharesWhenTradeSettled {
  private tradesRepository: TradesRepository;
  private northCapitalAdapter: TradingNorthCapitalAdapter;
  private vertaloAdapter: TradingVertaloAdapter;

  constructor(tradesRepository: TradesRepository, northCapitalAdapter: TradingNorthCapitalAdapter, vertaloAdapter: TradingVertaloAdapter) {
    this.tradesRepository = tradesRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.vertaloAdapter = vertaloAdapter;
  }

  static getClassName = () => 'TransferSharesWhenTradeSettled';

  async execute(investmentId: string): Promise<boolean> {
    try {
      const trade = await this.tradesRepository.getTradeByInvestmentId(investmentId);

      // CHECK_IF_FUNDS_WERE_DISBURSED
      // -> record payment in vertalo
      // -> transfer shares to investor
      if (!trade) {
        throw new Error(`Trade ${investmentId} is not awaiting funding`);
      }

      console.info(`[Trade ${investmentId}]`, '[MOCK] TransferSharesWhenTradeSettled');

      return true;
    } catch (error) {
      console.error(`[Trade ${investmentId}]`, 'TransferSharesWhenTradeSettled failed', error);

      return false;
    }
  }
}
