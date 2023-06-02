import type { Investment } from 'Investments/Domain/Investments/Investment';
import { FeesRepository } from 'Investments/Infrastructure/Adapters/Repository/FeesRepository';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';

class StartInvestment {
  private readonly investmentsRepository: InvestmentsRepository;
  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;
  private readonly feesRepository: FeesRepository;

  constructor(investmentsRepository: InvestmentsRepository, subscriptionAgreementRepository: SubscriptionAgreementRepository, feesRepository: FeesRepository) {
    this.investmentsRepository = investmentsRepository;
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
    this.feesRepository = feesRepository;
  }

  static getClassName = (): string => 'StartInvestment';

  async checkFees(investment: Investment, approveFees: boolean) {
    if (!investment.hasFee()) {
      return true;
    }

    if (approveFees) {
      investment.approveFee();
      const fee = investment.getFee()!;
      const isApproved = await this.feesRepository.approveFee(fee);

      return isApproved;
    } else {
      const isFeeApproved = investment.isFeeApproved();

      return isFeeApproved;
    }
  }

  async execute(profileId: string, investmentId: string, approveFees: boolean) {
    const investment = await this.investmentsRepository.get(investmentId);

    if (!investment) {
      return false;
    }

    if (investment.isStartedInvestment()) {
      return true;
    }

    const isFeeApproved = await this.checkFees(investment, approveFees);

    if (!isFeeApproved) {
      return false;
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
