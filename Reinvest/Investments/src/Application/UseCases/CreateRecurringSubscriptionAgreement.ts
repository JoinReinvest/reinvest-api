import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { SubscriptionAgreement } from 'Investments/Domain/Investments/SubscriptionAgreement';
import { AgreementTypes, RecurringInvestmentStatus, SubscriptionAgreementStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import type { TemplateContentType } from 'Templates/Types';

export type RecurringInvestmentSubscriptionAgreementCreate = {
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

    const recurringInvestment = await this.recurringInvestmentsRepository.get(profileId, accountId, RecurringInvestmentStatus.DRAFT);

    if (!recurringInvestment) {
      return false;
    }

    const { id: investmentId } = recurringInvestment.toObject();
    const subscriptionAgreement = SubscriptionAgreement.createForRecurringInvestment(id, profileId, accountId, investmentId, mockedContentFieldsJson);
    await this.subscriptionAgreementRepository.createOrUpdate(subscriptionAgreement);

    return id;
  }
}

export default CreateRecurringSubscriptionAgreement;
