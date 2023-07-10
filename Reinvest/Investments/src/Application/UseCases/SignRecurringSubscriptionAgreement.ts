import { AgreementTypes, RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { DocumentsService } from 'Investments/Infrastructure/Adapters/Modules/DocumentsService';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { DomainEvent } from 'SimpleAggregator/Types';
import { SubscriptionAgreementEvent, SubscriptionAgreementEvents } from 'Investments/Domain/Investments/SubscriptionAgreement';

class SignRecurringSubscriptionAgreement {
  static getClassName = (): string => 'SignRecurringSubscriptionAgreement';

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;
  private documentsService: DocumentsService;

  constructor(
    subscriptionAgreementRepository: SubscriptionAgreementRepository,
    recurringInvestmentsRepository: RecurringInvestmentsRepository,
    documentsService: DocumentsService,
  ) {
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
    this.documentsService = documentsService;
  }

  async execute(profileId: string, accountId: string, clientIp: string) {
    const events: DomainEvent[] = [];
    const recurringInvestment = await this.recurringInvestmentsRepository.get(profileId, accountId, RecurringInvestmentStatus.DRAFT);

    if (!recurringInvestment) {
      return false;
    }

    const recurringInvestmentId = recurringInvestment.getId();
    const subscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreementByInvestmentId(
      profileId,
      recurringInvestmentId,
      AgreementTypes.RECURRING_INVESTMENT,
    );

    if (!subscriptionAgreement) {
      return false;
    }

    subscriptionAgreement.sign(clientIp);
    const isSigned = await this.subscriptionAgreementRepository.store(subscriptionAgreement);

    if (!isSigned) {
      return false;
    }

    const subscriptionAgreementId = subscriptionAgreement.getId();
    recurringInvestment.assignSubscriptionAgreement(subscriptionAgreementId);

    const isAssigned = await this.recurringInvestmentsRepository.assignSubscriptionAgreementAndUpdateStatus(recurringInvestment);

    if (isAssigned) {
      events.push(<SubscriptionAgreementEvent>{
        id: subscriptionAgreementId,
        kind: SubscriptionAgreementEvents.RecurringSubscriptionAgreementSigned,
        data: {
          profileId,
        },
      });

      await this.recurringInvestmentsRepository.publishEvents(events);
    }

    return isAssigned;
  }
}

export default SignRecurringSubscriptionAgreement;
