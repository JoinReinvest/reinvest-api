import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { SubscriptionAgreement } from 'Investments/Domain/Investments/SubscriptionAgreement';
import { RecurringInvestmentFrequency, RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { SubscriptionAgreementDataCollector } from 'Investments/Infrastructure/Adapters/Modules/SubscriptionAgreementDataCollector';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { LatestTemplateContentFields } from 'Templates/TemplateConfiguration';
import { Templates } from 'Templates/Types';

const mockedContentFieldsJson = <LatestTemplateContentFields[Templates.RECURRING_SUBSCRIPTION_AGREEMENT]>{
  nameOfAsset: 'Community REIT',
  nameOfOffering: 'Community REIT',
  offeringsCircularLink: 'https://www.google.com',
  tendererCompanyName: 'REINVEST Corp.',
  purchaserName: 'John Smith',
  firstName: 'John',
  lastName: 'Smith',
  dateOfBirth: '12/31/1978',
  companyName: '-',
  address: '123 Main St., New York, NY 10001',
  // example SSN
  sensitiveNumber: '123-45-6789',
  isAccreditedInvestor: true,
  isFINRAMember: true,
  // example FINRA institution name
  FINRAInstitutionName: 'Cleaning Ltd.',
  isTradedCompanyHolder: true,
  tickerSymbols: 'NASDAQ:RUN, NYSE:TDOC',
  phoneNumber: '+1 (123) 456-7890',
  email: 'john.smith@test.com',
  investedAmount: '$1,000.00',
  unitPrice: '$1.00',
  dateOfAgreement: '12/24/2023',
  ipAddress: '74.234.0.35',
  signingTimestamp: '1632931200000',
  startDate: '12/25/2023',
  frequency: 'MONTHLY',
};

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

    const recurringInvestment = await this.recurringInvestmentsRepository.get(profileId, accountId, RecurringInvestmentStatus.DRAFT);

    if (!recurringInvestment) {
      return false;
    }

    const dateOfAgreement = DateTime.now();
    const { id: investmentId, amount, portfolioId } = recurringInvestment.toObject();
    const { frequency, startDate } = recurringInvestment.getSchedule();

    const collectedFields = await this.subscriptionAgreementDataCollector.collectData(portfolioId, profileId, accountId);

    const contentFields = <LatestTemplateContentFields[Templates.RECURRING_SUBSCRIPTION_AGREEMENT]>{
      ...collectedFields,
      investedAmount: Money.lowPrecision(amount).getFormattedAmount(),
      dateOfAgreement: DateTime.now().toFormattedDate('MM/DD/YYYY'),
      ipAddress: '',
      signingTimestamp: '',
      signingDate: '',
      startDate: DateTime.from(startDate).toFormattedDate('MM/DD/YYYY'),
      frequency: frequency === RecurringInvestmentFrequency.BI_WEEKLY ? 'BIWEEKLY' : frequency,
    };

    const subscriptionAgreement = SubscriptionAgreement.createForRecurringInvestment(id, profileId, accountId, investmentId, dateOfAgreement, contentFields);
    await this.subscriptionAgreementRepository.createOrUpdate(subscriptionAgreement);

    return id;
  }
}

export default CreateRecurringSubscriptionAgreement;
