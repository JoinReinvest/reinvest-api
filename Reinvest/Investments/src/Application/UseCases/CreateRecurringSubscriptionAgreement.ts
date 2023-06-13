import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { AgreementTypes, RecurringInvestmentStatus, SubscriptionAgreementStatus } from 'Investments/Domain/Investments/Types';
import { latestSubscriptionAgreementVersion } from 'Investments/Domain/SubscriptionAgreements/subscriptionAgreementsTemplates';
import type { DynamicType } from 'Investments/Domain/SubscriptionAgreements/types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';

export type RecurringInvestmentSubscriptionAgreementCreate = {
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

class CreateRecurringSubscriptionAgreement {
  static getClassName = (): string => 'CreateRecurringSubscriptionAgreement';

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(
    subscriptionAgreementRepository: SubscriptionAgreementRepository,
    recurringInvestmentsRepository: RecurringInvestmentsRepository,
    idGenerator: IdGeneratorInterface,
  ) {
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
    this.idGenerator = idGenerator;
  }

  async execute(profileId: string, accountId: string) {
    const id = this.idGenerator.createUuid();

    const recurringInvestment = await this.recurringInvestmentsRepository.get(accountId, RecurringInvestmentStatus.DRAFT);

    if (!recurringInvestment) {
      return false;
    }

    const { id: investmentId } = recurringInvestment.toObject();

    const subscription: RecurringInvestmentSubscriptionAgreementCreate = {
      id,
      accountId,
      profileId,
      investmentId,
      status: SubscriptionAgreementStatus.WAITING_FOR_SIGNATURE,
      agreementType: AgreementTypes.RECURRING_INVESTMENT,
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

export default CreateRecurringSubscriptionAgreement;
