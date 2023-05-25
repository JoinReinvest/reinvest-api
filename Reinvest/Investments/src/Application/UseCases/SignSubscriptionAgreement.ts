import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';

class SignSubscriptionAgreement {
  static getClassName = (): string => 'SignSubscriptionAgreement';

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;

  constructor(subscriptionAgreementRepository: SubscriptionAgreementRepository) {
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
  }

  async execute(profileId: string, investmentId: string, clientIp: string) {
    const subscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreementByInvestmentId(profileId, investmentId);

    if (!subscriptionAgreement) {
      return false;
    }

    subscriptionAgreement.setSignature(clientIp);

    const isSigned = await this.subscriptionAgreementRepository.signSubscriptionAgreement(subscriptionAgreement);

    if (!isSigned) {
      return false;
    }

    return subscriptionAgreement.id;
  }
}

export default SignSubscriptionAgreement;
