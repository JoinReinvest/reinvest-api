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

    const { ip, status, subscriptionAgreementPdfDateCreated, subscriptionAgreementId, portfolioId, bankAccountId, investmentAmount, feeAmount } =
      investmentDetails;

    if (status !== InvestmentStatus.IN_PROGRESS) {
      console.warn(`[FinalizeInvestmentEventHandler] Investment with id ${investmentId} is not in progress. Current status: ${status}`);
    }

    if (!subscriptionAgreementId) {
      console.error(`[FinalizeInvestmentEventHandler] Subscription agreement id for investment with id ${investmentId} not found or signed`);

      return;
    }

    // TODO - uncomment it when pdf creation is implemented
    // if (!subscriptionAgreementPdfDateCreated || !ip) {
    // console.warn(`[FinalizeInvestmentEventHandler] Subscription agreement PDF date created or ip is not set for investment ${investmentId}}`);
    //   // TODO - send command to generate pdf
    // }

    await this.eventBus.publish(<InvestmentFinalized>{
      kind: TransactionEvents.INVESTMENT_FINALIZED,
      data: {
        amount: investmentAmount,
        fees: !feeAmount ? 0 : feeAmount,
        ip: '8.8.8.8', // TODO - get ip from subscription agreement when implemented
        bankAccountId,
        subscriptionAgreementId,
        portfolioId,
      },
      id: investmentId,
    });
  }
}
