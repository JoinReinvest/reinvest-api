import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { Template } from 'Templates/Template';

class SubscriptionAgreementQuery {
  static getClassName = (): string => 'SubscriptionAgreementQuery';

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;

  constructor(subscriptionAgreementRepository: SubscriptionAgreementRepository) {
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
  }

  async execute(profileId: string, subscriptionAgreementId: string) {
    const subscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreement(profileId, subscriptionAgreementId);

    if (!subscriptionAgreement) {
      return false;
    }

    const { id, agreementType, status, dateCreated, signedAt } = subscriptionAgreement.toObject();
    const { template, version, content } = subscriptionAgreement.forParser();
    const agreementTemplate = new Template(template, content, version);

    return {
      id,
      type: agreementType,
      status,
      createdAt: dateCreated.toIsoDateTime(),
      signedAt: signedAt ? signedAt.toIsoDateTime() : null,
      content: agreementTemplate.toArray(),
    };
  }
}

export default SubscriptionAgreementQuery;
