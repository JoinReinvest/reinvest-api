import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { DomainEvent } from 'SimpleAggregator/Types';

class SignRecurringSubscriptionAgreement {
  static getClassName = (): string => 'SignRecurringSubscriptionAgreement';

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;

  constructor(subscriptionAgreementRepository: SubscriptionAgreementRepository, recurringInvestmentsRepository: RecurringInvestmentsRepository) {
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
  }

  async execute(profileId: string, accountId: string, clientIp: string) {
    const events: DomainEvent[] = [];

    const recurringInvestment = await this.recurringInvestmentsRepository.get(accountId, RecurringInvestmentStatus.DRAFT);

    if (!recurringInvestment) {
      return false;
    }

    const recurringInvestmentId = recurringInvestment.getId();

    const subscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreementByInvestmentId(profileId, recurringInvestmentId);

    if (!subscriptionAgreement) {
      return false;
    }

    subscriptionAgreement.setSignature(clientIp);

    const isSigned = await this.subscriptionAgreementRepository.signSubscriptionAgreement(subscriptionAgreement);

    if (!isSigned) {
      return false;
    }

    const subscriptionAgreementId = subscriptionAgreement.getId();

    recurringInvestment.assignSubscriptionAgreement(subscriptionAgreementId);

    const isAssigned = await this.recurringInvestmentsRepository.assignSubscriptionAgreementAndUpdateStatus(recurringInvestment);

    if (isAssigned) {
      events.push({
        id: subscriptionAgreementId,
        kind: 'RecurringInvestmentSubscriptionAgreementSigned',
      });

      await this.recurringInvestmentsRepository.publishEvents(events);
    }

    return isAssigned;
  }
}

export default SignRecurringSubscriptionAgreement;
