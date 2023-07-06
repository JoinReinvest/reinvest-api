import { UUID } from 'HKEKTypes/Generics';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';

export class MarkSubscriptionAgreementAsGenerated {
  static getClassName = (): string => 'MarkSubscriptionAgreementAsGenerated';

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;

  constructor(subscriptionAgreementRepository: SubscriptionAgreementRepository) {
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
  }

  async execute(profileId: UUID, subscriptionAgreementId: UUID): Promise<void> {
    const subscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreement(profileId, subscriptionAgreementId);

    if (!subscriptionAgreement) {
      return;
    }

    subscriptionAgreement.markAsGenerated();
    await this.subscriptionAgreementRepository.store(subscriptionAgreement);
  }
}
