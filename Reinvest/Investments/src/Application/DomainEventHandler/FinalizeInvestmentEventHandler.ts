import { SubscriptionAgreementEvent, SubscriptionAgreementEvents } from 'Investments/Domain/Investments/SubscriptionAgreement';
import { InvestmentStatus } from 'Investments/Domain/Investments/Types';
import { InvestmentFinalized, TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { InvestmentsQueryRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsQueryRepository';
import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';

export class FinalizeInvestmentEventHandler implements EventHandler<TransactionEvent> {
  private investmentsQueryRepository: InvestmentsQueryRepository;
  private eventBus: EventBus;

  constructor(investmentsQueryRepository: InvestmentsQueryRepository, eventBus: EventBus) {
    this.investmentsQueryRepository = investmentsQueryRepository;
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'FinalizeInvestmentEventHandler';

  async handle(event: TransactionEvent): Promise<void> {
    const investmentId = event.id;

    const investmentDetails = await this.investmentsQueryRepository.getInvestmentDetailsForTransaction(investmentId);

    if (!investmentDetails) {
      console.error(`[FinalizeInvestmentEventHandler] Investment with id ${investmentId} not found`);

      return;
    }

    const {
      ip,
      tradeId,
      profileId,
      status,
      subscriptionAgreementPdfDateCreated,
      subscriptionAgreementId,
      portfolioId,
      bankAccountId,
      investmentAmount,
      feeAmount,
    } = investmentDetails;

    if (status !== InvestmentStatus.IN_PROGRESS) {
      console.warn(`[FinalizeInvestmentEventHandler] Investment with id ${investmentId} is not in progress. Current status: ${status}`);
    }

    if (!subscriptionAgreementId || !ip) {
      console.error(`[FinalizeInvestmentEventHandler] Subscription agreement id for investment with id ${investmentId} not found or signed or ip is not set`);

      return;
    }

    if (!subscriptionAgreementPdfDateCreated) {
      console.warn(`[FinalizeInvestmentEventHandler] Subscription agreement PDF not created for investment ${investmentId}}`);
      await this.eventBus.publish(<SubscriptionAgreementEvent>{
        id: subscriptionAgreementId,
        kind: SubscriptionAgreementEvents.GenerateSubscriptionAgreementCommand,
        data: {
          profileId,
        },
      });

      return;
    }

    // TODO add info if the investment is for beneficiary
    await this.eventBus.publish(<InvestmentFinalized>{
      kind: TransactionEvents.INVESTMENT_FINALIZED,
      data: {
        amount: investmentAmount,
        fees: !feeAmount ? 0 : feeAmount,
        ip: '8.8.8.8', // TODO - get ip from subscription agreement when implemented
        bankAccountId,
        subscriptionAgreementId,
        portfolioId,
        userTradeId: tradeId,
      },
      id: investmentId,
    });
  }
}
