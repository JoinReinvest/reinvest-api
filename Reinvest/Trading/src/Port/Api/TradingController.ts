import { UUID } from 'HKEKTypes/Generics';
import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';

export class TradingController {
  static getClassName = () => 'TradingController';
  private tradeRepository: TradesRepository;

  constructor(tradeRepository: TradesRepository) {
    this.tradeRepository = tradeRepository;
  }

  async getInvestmentIdByTradeId(tradeId: string): Promise<UUID | null> {
    const trade = await this.tradeRepository.getTradeByTradeId(tradeId);

    if (!trade) {
      return null;
    }

    return trade.getInvestmentId();
  }
}
