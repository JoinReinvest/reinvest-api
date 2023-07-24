import { FeesRepository } from 'Investments/Infrastructure/Adapters/Repository/FeesRepository';

class IsFeeApproved {
  static getClassName = (): string => 'IsFeeApproved';

  private readonly feesRepository: FeesRepository;

  constructor(feesRepository: FeesRepository) {
    this.feesRepository = feesRepository;
  }

  async execute(investmentId: string) {
    const fee = await this.feesRepository.getFeeByInvestmentId(investmentId);

    if (!fee || fee.isApproved()) {
      return true;
    }

    return false;
  }
}

export default IsFeeApproved;
