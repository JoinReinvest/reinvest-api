import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';

import { AgreementTypes, SubscriptionAgreementStatus } from '../Adapters/PostgreSQL/InvestmentsTypes';
import { SubscriptionAgreementRepository } from '../Adapters/Repository/SubscriptionAgreementRepository';

export type SubscriptionAgreementCreate = {
  accountId: string;
  agreementType: AgreementTypes;
  id: string;
  investmentId: string;
  profileId: string;
  status: SubscriptionAgreementStatus;
};

class CreateSubscriptionAgreement {
  static getClassName = (): string => 'CreateSubscriptionAgreement';

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(subscriptionAgreementRepository: SubscriptionAgreementRepository, idGenerator: IdGeneratorInterface) {
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
    this.idGenerator = idGenerator;
  }

  async execute(profileId: string, accountId: string, investmentId: string) {
    const id = this.idGenerator.createUuid();

    const subscription: SubscriptionAgreementCreate = {
      id,
      accountId,
      profileId,
      investmentId,
      status: SubscriptionAgreementStatus.WAITING_FOR_SIGNATURE,
      agreementType: AgreementTypes.DIRECT_DEPOSIT,
    };
    const status = await this.subscriptionAgreementRepository.create(subscription);

    if (!status) {
      return false;
    }

    const subscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreement(profileId, accountId, investmentId);

    if (!subscriptionAgreement) {
      return false;
    }

    return {
      id: subscriptionAgreement.id,
      type: subscriptionAgreement.agreementType,
      status: subscriptionAgreement.status,
      createdAt: subscriptionAgreement.dateCreated,
      signedAt: subscriptionAgreement.signedAt,
      content: subscriptionAgreement.contentFieldsJson,
    };
  }
}

export default CreateSubscriptionAgreement;
