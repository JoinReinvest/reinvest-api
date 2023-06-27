import { UUID } from 'HKEKTypes/Generics';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';

class StartInvestment {
  private readonly investmentsRepository: InvestmentsRepository;

  constructor(investmentsRepository: InvestmentsRepository) {
    this.investmentsRepository = investmentsRepository;
  }

  static getClassName = (): string => 'StartInvestment';

  async execute(profileId: UUID, investmentId: UUID, approveFees: boolean) {
    const investment = await this.investmentsRepository.getInvestmentByProfileAndId(profileId, investmentId);

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
