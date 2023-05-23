import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';

export class CheckIsTradeApproved {
  private tradesRepository: TradesRepository;
  private northCapitalAdapter: TradingNorthCapitalAdapter;

  constructor(tradesRepository: TradesRepository, northCapitalAdapter: TradingNorthCapitalAdapter) {
    this.tradesRepository = tradesRepository;
    this.northCapitalAdapter = northCapitalAdapter;
  }

  static getClassName = () => 'CheckIsTradeApproved';

  async execute(investmentId: string): Promise<boolean> {
    try {
      const trade = await this.tradesRepository.getTradeByInvestmentId(investmentId);

      if (!trade) {
        throw new Error(`Trade ${investmentId} is not awaiting approval`);
      }

      // TODO RIA-236

      console.info(`[Trade ${investmentId}]`, 'Check is trade approved');
      //
      // if (trade.isTradeAwaitingFunding()) {
      //   const tradeId = trade.getTradeId();
      //   const tradeStatus = await this.northCapitalAdapter.getTradeStatus(tradeId);
      //
      //   if (tradeStatus === 'funded') {
      //     trade.setTradeStatusToFunded();
      //     await this.tradesRepository.updateTrade(trade);
      //     console.info(`[Trade ${investmentId}]`, 'Trade is funded');
      //   } else {
      //     console.info(`[Trade ${investmentId}]`, 'Trade is NOT funded yet:', tradeStatus);
      //
      //     return false;
      //   }
      // }

      console.info(`[Trade ${investmentId}]`, '[MOCK] RR Approval is Approved');

      return true;
    } catch (error) {
      console.error(`[Trade ${investmentId}]`, 'Trade approval process failed', error);

      return false;
    }
  }
}
