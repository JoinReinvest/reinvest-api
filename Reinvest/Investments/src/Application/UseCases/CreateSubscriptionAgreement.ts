import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { SubscriptionAgreement } from 'Investments/Domain/Investments/SubscriptionAgreement';
import { AgreementTypes, SubscriptionAgreementStatus } from 'Investments/Domain/Investments/Types';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { TemplateContentType, Templates } from 'Templates/Types';
import { LatestTemplateContentFields } from 'Templates/TemplateConfiguration';

export type SubscriptionAgreementCreate = {
  accountId: string;
  agreementType: AgreementTypes;
  contentFieldsJson: TemplateContentType;
  id: string;
  investmentId: string;
  profileId: string;
  status: SubscriptionAgreementStatus;
  templateVersion: number;
};

const mockedContentFieldsJson = <LatestTemplateContentFields[Templates.SUBSCRIPTION_AGREEMENT]>{
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
};

class CreateSubscriptionAgreement {
  static getClassName = (): string => 'CreateSubscriptionAgreement';

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;
  private readonly investmentsRepository: InvestmentsRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(
    subscriptionAgreementRepository: SubscriptionAgreementRepository,
    investmentsRepository: InvestmentsRepository,
    idGenerator: IdGeneratorInterface,
  ) {
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
    this.investmentsRepository = investmentsRepository;
    this.idGenerator = idGenerator;
  }

  async execute(profileId: string, investmentId: string) {
    const alreadyCreatedSubscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreementByInvestmentId(
      profileId,
      investmentId,
      AgreementTypes.DIRECT_DEPOSIT,
    );

    if (alreadyCreatedSubscriptionAgreement) {
      return alreadyCreatedSubscriptionAgreement.getId();
    }

    const id = this.idGenerator.createUuid();
    const investment = await this.investmentsRepository.getInvestmentByProfileAndId(profileId, investmentId);

    if (!investment) {
      return false;
    }

    const { accountId } = investment.toObject();
    const subscriptionAgreement = SubscriptionAgreement.createForInvestment(id, profileId, accountId, investmentId, mockedContentFieldsJson);
    await this.subscriptionAgreementRepository.store(subscriptionAgreement);

    return id;
  }
}

export default CreateSubscriptionAgreement;
