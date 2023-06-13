import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { AgreementTypes, SubscriptionAgreementStatus } from 'Investments/Domain/Investments/Types';
import { latestSubscriptionAgreementVersion } from 'Investments/Domain/SubscriptionAgreements/subscriptionAgreementsTemplates';
import { DynamicType } from 'Investments/Domain/SubscriptionAgreements/types';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';

export type SubscriptionAgreementCreate = {
  accountId: string;
  agreementType: AgreementTypes;
  contentFieldsJson: DynamicType;
  id: string;
  investmentId: string;
  profileId: string;
  status: SubscriptionAgreementStatus;
  templateVersion: number;
};

const mockedContentFieldsJson = {
  dateOfBirth: '03/24/2023',
  email: 'john.smith@gmail.com',
  fullName: 'John Smith',
  telephoneNumber: '+17778887775',
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
    const alreadyCreatedSubscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreementByInvestmentId(profileId, investmentId);

    if (alreadyCreatedSubscriptionAgreement) {
      const id = alreadyCreatedSubscriptionAgreement.getId();

      return id;
    }

    const id = this.idGenerator.createUuid();

    const investment = await this.investmentsRepository.get(investmentId);

    if (!investment) {
      return false;
    }

    const { accountId } = investment.toObject();

    const subscription: SubscriptionAgreementCreate = {
      id,
      accountId: accountId,
      profileId,
      investmentId,
      status: SubscriptionAgreementStatus.WAITING_FOR_SIGNATURE,
      agreementType: AgreementTypes.DIRECT_DEPOSIT,
      contentFieldsJson: mockedContentFieldsJson,
      templateVersion: latestSubscriptionAgreementVersion,
    };

    const status = await this.subscriptionAgreementRepository.create(subscription);

    if (!status) {
      return false;
    }

    return id;
  }
}

export default CreateSubscriptionAgreement;
