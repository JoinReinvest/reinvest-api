import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { SubscriptionAgreement } from 'Investments/Domain/Investments/SubscriptionAgreement';
import { RecurringInvestmentFrequency, RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { SubscriptionAgreementDataCollector } from 'Investments/Infrastructure/Adapters/Modules/SubscriptionAgreementDataCollector';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { DateTime } from 'Money/DateTime';
import { LatestTemplateContentFields } from 'Templates/TemplateConfiguration';
import { Templates } from 'Templates/Types';

class CreateRecurringSubscriptionAgreement {
  static getClassName = (): string => 'CreateRecurringSubscriptionAgreement';
  private subscriptionAgreementDataCollector: SubscriptionAgreementDataCollector;

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(
    subscriptionAgreementRepository: SubscriptionAgreementRepository,
    recurringInvestmentsRepository: RecurringInvestmentsRepository,
    subscriptionAgreementDataCollector: SubscriptionAgreementDataCollector,
    idGenerator: IdGeneratorInterface,
  ) {
    this.subscriptionAgreementDataCollector = subscriptionAgreementDataCollector;
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
    this.idGenerator = idGenerator;
  }

  async execute(profileId: string, accountId: string) {
    const id = this.idGenerator.createUuid();

    const recurringInvestment = await this.recurringInvestmentsRepository.getRecurringInvestment(profileId, accountId, RecurringInvestmentStatus.DRAFT);

    if (!recurringInvestment) {
      return false;
    }

    const dateOfAgreement = DateTime.now();
    const { id: investmentId, amount, portfolioId, frequency, startDate } = recurringInvestment.toObject();

    const collectedFields = await this.subscriptionAgreementDataCollector.collectData(portfolioId, profileId, accountId);

    const contentFields = <LatestTemplateContentFields[Templates.RECURRING_SUBSCRIPTION_AGREEMENT]>{
      ...collectedFields,
      investedAmount: amount.getFormattedAmount(),
      dateOfAgreement: DateTime.now().toFormattedDate('MM/DD/YYYY'),
      ipAddress: '',
      signingTimestamp: '',
      signingDate: '',
      startDate: startDate.toFormattedDate('MM/DD/YYYY'),
      frequency: frequency === RecurringInvestmentFrequency.BI_WEEKLY ? 'BIWEEKLY' : frequency,
    };

    const subscriptionAgreement = SubscriptionAgreement.createForRecurringInvestment(id, profileId, accountId, investmentId, dateOfAgreement, contentFields);
    await this.subscriptionAgreementRepository.createOrUpdate(subscriptionAgreement);

    return id;
  }
}

export default CreateRecurringSubscriptionAgreement;
