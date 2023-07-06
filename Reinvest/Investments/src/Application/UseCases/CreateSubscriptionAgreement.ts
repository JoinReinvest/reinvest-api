import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { SubscriptionAgreement } from 'Investments/Domain/Investments/SubscriptionAgreement';
import { AgreementTypes, SubscriptionAgreementStatus } from 'Investments/Domain/Investments/Types';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { TemplateContentType } from 'Templates/Types';

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
