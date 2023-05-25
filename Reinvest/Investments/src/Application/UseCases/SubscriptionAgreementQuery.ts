import TemplateParser, { DynamicType } from '../../Application/Service/TemplateParser';
import { latestSubscriptionAgreementVersion, subscriptionAgreements } from '../../Domain/SubscriptionAgreement';
import { SubscriptionAgreementRepository } from '../../Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';

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

    const parser = new TemplateParser(subscriptionAgreements[latestSubscriptionAgreementVersion]);
    const parsed = parser.parse(subscriptionAgreement.contentFieldsJson as DynamicType);

    return {
      id: subscriptionAgreement.id,
      type: subscriptionAgreement.agreementType,
      status: subscriptionAgreement.status,
      createdAt: subscriptionAgreement.dateCreated,
      signedAt: subscriptionAgreement.signedAt,
      content: parsed,
    };
  }
}

export default SubscriptionAgreementQuery;
