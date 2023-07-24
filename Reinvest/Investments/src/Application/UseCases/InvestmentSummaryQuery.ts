import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';

class InvestmentSummaryQuery {
  private readonly investmentsRepository: InvestmentsRepository;

  constructor(investmentsRepository: InvestmentsRepository) {
    this.investmentsRepository = investmentsRepository;
  }

  static getClassName = (): string => 'InvestmentSummaryQuery';

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
      bankAccountId: investment.bankAccountId,
    };
  }
}

export default InvestmentSummaryQuery;
