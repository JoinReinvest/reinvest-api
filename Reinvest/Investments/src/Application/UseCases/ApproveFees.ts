import { FeesRepository } from 'Investments/Infrastructure/Adapters/Repository/FeesRepository';

class ApproveFees {
  static getClassName = (): string => 'ApproveFees';

  private readonly feesRepository: FeesRepository;

  constructor(feesRepository: FeesRepository) {
    this.feesRepository = feesRepository;
  }

  async execute(profileId: string, investmentId: string) {
    const fee = await this.feesRepository.getFeeByInvestmentId(investmentId);

    if (!fee || fee.isApproved()) {
      return true;
    }

    fee.approveFee();

    const isApproved = await this.feesRepository.approveFee(fee);

    return isApproved;
  }
}

export default ApproveFees;
