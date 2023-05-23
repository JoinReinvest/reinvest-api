import { InvestmentsRepository } from '../Adapters/Repository/InvestmentsRepository';

const mockedTradeId = '1f34478a-3456-65x7-b670-f9750685e291';

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
      tradeId: mockedTradeId,
      createdAt: investment.dateCreated,
      amount: investment.getInvestmentAmount(),
      status: investment.status,
      investmentFees: investment.getFeeAmount(),
      subscriptionAgreementId: investment.subscriptionAgreementId,
    };
  }
}

export default InvestmentSummaryQuery;
