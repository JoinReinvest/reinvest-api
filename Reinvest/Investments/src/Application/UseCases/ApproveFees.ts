import { FeesRepository } from '../../Infrastructure/Adapters/Repository/FeesRepository';

class ApproveFees {
  static getClassName = (): string => 'ApproveFees';

  private readonly feesRepository: FeesRepository;

  constructor(feesRepository: FeesRepository) {
    this.feesRepository = feesRepository;
  }

  async execute(profileId: string, investmentId: string) {
    const fee = await this.feesRepository.get(investmentId);

    if (!fee) {
      return false;
    }

    fee.approveFee();

    const isApproved = await this.feesRepository.approveFee(fee);

    if (!isApproved) {
      return false;
    }

    return true;
  }
}

export default ApproveFees;
