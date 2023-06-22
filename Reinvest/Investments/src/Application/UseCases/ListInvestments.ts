import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { Money } from 'Money/Money';
import { Pagination } from 'Reinvest/Investments/src/Application/Pagination';

class ListInvestments {
  private readonly investmentsRepository: InvestmentsRepository;

  constructor(investmentsRepository: InvestmentsRepository) {
    this.investmentsRepository = investmentsRepository;
  }

  static getClassName = (): string => 'ListInvestments';

  async execute(profileId: string, accountId: string, pagination: Pagination) {
    const investmets = await this.investmentsRepository.getInvestments(profileId, accountId, pagination);

    if (!investmets?.length) {
      return null;
    }

    const list = investmets.map(investmet => {
      const { id, tradeId, dateCreated, amount, status, subscriptionAgreementId } = investmet.toObject();
      const fee = investmet.getFee();
      const money = new Money(amount);
      let investmentFees = null;

      if (fee) {
        const { amount: feeAmount } = fee.toObject();
        const feeMoney = new Money(feeAmount);

        investmentFees = {
          formatted: feeMoney.getFormattedAmount(),
          value: feeMoney.getAmount(),
        };
      }

      return {
        id,
        tradeId,
        createdAt: dateCreated,
        amount: {
          formatted: money.getFormattedAmount(),
          value: money.getAmount(),
        },
        status,
        investmentFees,
        subscriptionAgreementId,
      };
    });

    return list;
  }
}

export default ListInvestments;
