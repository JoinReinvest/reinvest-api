import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { VerificationService } from 'Trading/Adapter/Module/VerificationService';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';

export class CheckIsTradeApproved {
  private tradesRepository: TradesRepository;
  private northCapitalAdapter: TradingNorthCapitalAdapter;
  private eventBus: EventBus;
  private verificationService: VerificationService;

  constructor(
    tradesRepository: TradesRepository,
    northCapitalAdapter: TradingNorthCapitalAdapter,
    eventBus: EventBus,
    verificationService: VerificationService,
  ) {
    this.tradesRepository = tradesRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.eventBus = eventBus;
    this.verificationService = verificationService;
  }

  static getClassName = () => 'CheckIsTradeApproved';

  async execute(investmentId: string): Promise<void> {
    try {
      const trade = await this.tradesRepository.getTradeByInvestmentId(investmentId);

      if (!trade) {
        throw new Error(`Trade ${investmentId} is not awaiting approval`);
      }

      console.info(`[Trade ${investmentId}]`, 'Check is trade approved');
      const tradeVerification = trade.getTradeVerification();

      if (tradeVerification.isPending()) {
        const tradeApproval = await this.northCapitalAdapter.getTradeApproval(trade.getTradeId());

        tradeVerification.handle(tradeApproval);
        tradeVerification.makeDecision();

        trade.storeTradeVerification(tradeVerification);
        await this.tradesRepository.updateTrade(trade);
      }

      if (tradeVerification.isVerified()) {
        await this.verificationService.markAccountAsApproved(trade.getProfileId(), trade.getAccountIdForVerification());
        await this.eventBus.publish({
          kind: 'InvestmentApproved',
          id: investmentId,
        });

        return;
      }

      if (tradeVerification.isRejected()) {
        await this.verificationService.markAccountAsDisapproved(trade.getProfileId(), trade.getAccountIdForVerification(), tradeVerification.getObjectIds());
        await this.eventBus.publish({
          kind: 'InvestmentRejected',
          id: investmentId,
        });

        return;
      }

      if (tradeVerification.needMoreInfo()) {
        await this.verificationService.markAccountAsNeedMoreInfo(trade.getProfileId(), trade.getAccountIdForVerification(), tradeVerification.getObjectIds());

        return;
      }
    } catch (error) {
      console.error(`[Trade ${investmentId}]`, 'Trade approval process failed', error);
    }
  }
}
