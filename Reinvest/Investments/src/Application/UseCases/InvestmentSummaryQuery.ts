import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';

class InvestmentSummaryQuery {
  static getClassName = (): string => 'InvestmentSummaryQuery';

  private readonly investmentsRepository: InvestmentsRepository;

  constructor(investmentsRepository: InvestmentsRepository) {
    this.investmentsRepository = investmentsRepository;
  }

  async execute(profileId: string, investmentId: string) {
    const investment = await this.investmentsRepository.getInvestmentForSummary(investmentId);

    if (!investment) {
      return false;
    }

    return {
      id: investmentId,
      tradeId: investment.tradeId,
      createdAt: investment.dateCreated,
      amount: investment.getInvestmentAmount(),
      status: investment.status,
      investmentFees: investment.getFeeAmount(),
      subscriptionAgreementId: investment.subscriptionAgreementId,
    };
  }
}

export default InvestmentSummaryQuery;
