import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';

class StartInvestment {
  private readonly investmentsRepository: InvestmentsRepository;

  constructor(investmentsRepository: InvestmentsRepository) {
    this.investmentsRepository = investmentsRepository;
  }

  static getClassName = (): string => 'StartInvestment';

  async execute(profileId: string, investmentId: string, approveFees: boolean) {
    const investment = await this.investmentsRepository.get(investmentId);

    if (!investment) {
      return false;
    }

    if (investment.isStartedInvestment()) {
      return true;
    }

    if (approveFees) {
      investment.approveFee();
    }

    const subscriptionAgreementId = investment.getSubscriptionAgreementId();

    if (!subscriptionAgreementId) {
      return false;
    }

    const isStarted = investment.startInvestment();

    if (!isStarted) {
      return false;
    }

    const isCorrectlyUpdated = await this.investmentsRepository.updateInvestment(investment, approveFees);

    return isCorrectlyUpdated;
  }
}

export default StartInvestment;
