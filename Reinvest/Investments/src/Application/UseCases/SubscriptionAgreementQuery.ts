import TemplateParser from 'Investments/Application/Service/TemplateParser';
import { subscriptionAgreementsTemplate } from 'Investments/Domain/SubscriptionAgreements/subscriptionAgreementsTemplates';
import type { DynamicType, SubscriptionAgreementTemplateVersions } from 'Investments/Domain/SubscriptionAgreements/types';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';

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

    const { contentFieldsJson, templateVersion, id, agreementType, status, dateCreated, signedAt } = subscriptionAgreement.toObject();

    const parser = new TemplateParser(subscriptionAgreementsTemplate[templateVersion as SubscriptionAgreementTemplateVersions]);

    const parsed = parser.parse(contentFieldsJson as DynamicType);

    return {
      id,
      type: agreementType,
      status,
      createdAt: dateCreated,
      signedAt,
      content: parsed,
    };
  }
}

export default SubscriptionAgreementQuery;
