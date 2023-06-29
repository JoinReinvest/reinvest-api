import { FeesRepository } from 'Investments/Infrastructure/Adapters/Repository/FeesRepository';

class ApproveFees {
  static getClassName = (): string => 'ApproveFees';

  private readonly feesRepository: FeesRepository;

  constructor(feesRepository: FeesRepository) {
    this.feesRepository = feesRepository;
  }

  async execute(profileId: string, investmentId: string, ip: string): Promise<boolean> {
    const fee = await this.feesRepository.getFeeByInvestmentId(investmentId);

    if (!fee || fee.isApproved()) {
      return true;
    }

    fee.approveFee(ip);

    return this.feesRepository.storeFee(fee);
  }
}

export default ApproveFees;
