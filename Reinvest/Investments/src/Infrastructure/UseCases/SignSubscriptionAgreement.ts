import { InvestmentsRepository } from '../Adapters/Repository/InvestmentsRepository';
import { SubscriptionAgreementRepository } from '../Adapters/Repository/SubscriptionAgreementRepository';

class SignSubscriptionAgreement {
  static getClassName = (): string => 'SignSubscriptionAgreement';

  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;
  private readonly investmentsRepository: InvestmentsRepository;

  constructor(subscriptionAgreementRepository: SubscriptionAgreementRepository, investmentsRepository: InvestmentsRepository) {
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
    this.investmentsRepository = investmentsRepository;
  }

  async execute(profileId: string, investmentId: string) {
    const investment = await this.subscriptionAgreementRepository.signSubscriptionAgreement(profileId, investmentId);

    if (!investment) {
      return false;
    }

    return true;
  }
}

export default SignSubscriptionAgreement;
