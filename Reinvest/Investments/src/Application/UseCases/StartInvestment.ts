import { InvestmentStatus } from '../../Domain/Investments/Types';
import { InvestmentsRepository } from '../../Infrastructure/Adapters/Repository/InvestmentsRepository';
import { SubscriptionAgreementRepository } from '../../Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';

class StartInvestment {
  static getClassName = (): string => 'StartInvestment';

  private readonly investmentsRepository: InvestmentsRepository;
  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;

  constructor(investmentsRepository: InvestmentsRepository, subscriptionAgreementRepository: SubscriptionAgreementRepository) {
    this.investmentsRepository = investmentsRepository;
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
  }

  async execute(profileId: string, investmentId: string) {
    const investment = await this.investmentsRepository.get(investmentId);

    if (!investment) {
      return false;
    }

    if (!investment.subscriptionAgreementId) {
      return false;
    }

    const subscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreement(profileId, investment.subscriptionAgreementId);
    investment.updateStatus(InvestmentStatus.FUNDED);

    return true;
  }
}

export default StartInvestment;
