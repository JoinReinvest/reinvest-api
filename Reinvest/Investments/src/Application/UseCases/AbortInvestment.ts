import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';

class AbortInvestment {
  private readonly investmentsRepository: InvestmentsRepository;

  constructor(investmentsRepository: InvestmentsRepository) {
    this.investmentsRepository = investmentsRepository;
  }

  static getClassName = (): string => 'AbortInvestment';

  async execute(profileId: string, investmentId: string) {
    try {
      const investment = await this.investmentsRepository.getInvestmentByProfileAndId(profileId, investmentId);

      if (!investment) {
        return false;
      }

      investment.abort();
      await this.investmentsRepository.store(investment);

      return true;
    } catch (e) {
      console.log(e);

      return false;
    }
  }
}

export default AbortInvestment;
