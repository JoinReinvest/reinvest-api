import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';

class StartInvestment {
  private readonly investmentsRepository: InvestmentsRepository;
  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;

  constructor(investmentsRepository: InvestmentsRepository, subscriptionAgreementRepository: SubscriptionAgreementRepository) {
    this.investmentsRepository = investmentsRepository;
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
  }

  static getClassName = (): string => 'StartInvestment';

  async execute(profileId: string, investmentId: string) {
    const investment = await this.investmentsRepository.get(investmentId);

    if (!investment) {
      return false;
    }

    if (investment.isStartedInvestment()) {
      return true;
    }

    const subscriptionAgreementId = investment.getSubscriptionAgreementId();

    if (!subscriptionAgreementId) {
      return false;
    }

    const subscriptionAgreement = await this.subscriptionAgreementRepository.getSubscriptionAgreement(profileId, subscriptionAgreementId);

    if (!subscriptionAgreement?.isSigned()) {
      return false;
    }

    investment.startInvestment();

    const isStarted = await this.investmentsRepository.startInvestment(investment);

    return isStarted;
  }
}

export default StartInvestment;
