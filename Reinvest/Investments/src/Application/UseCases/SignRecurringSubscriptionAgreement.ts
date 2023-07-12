import { SubscriptionAgreementEvent, SubscriptionAgreementEvents } from 'Investments/Domain/Investments/SubscriptionAgreement';
import { AgreementTypes, RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { DocumentsService } from 'Investments/Infrastructure/Adapters/Modules/DocumentsService';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';

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

  async execute(profileId: string, accountId: string, clientIp: string): Promise<boolean> {
    const recurringInvestment = await this.recurringInvestmentsRepository.getRecurringInvestment(profileId, accountId, RecurringInvestmentStatus.DRAFT);

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

    return this.recurringInvestmentsRepository.store(recurringInvestment, [
      <SubscriptionAgreementEvent>{
        id: subscriptionAgreementId,
        kind: SubscriptionAgreementEvents.RecurringSubscriptionAgreementSigned,
        data: {
          profileId,
        },
      },
    ]);
  }
}

export default SignRecurringSubscriptionAgreement;
