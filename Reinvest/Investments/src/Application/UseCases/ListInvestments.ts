import { Investment } from 'Investments/Domain/Investments/Investment';
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
    const investments = await this.investmentsRepository.getInvestments(profileId, accountId, pagination);

    return investments.map((investment: Investment) => {
      const { id, tradeId, dateCreated, amount } = investment.toObject();
      const money = new Money(amount);

      return {
        id,
        tradeId,
        createdAt: dateCreated,
        amount: {
          formatted: money.getFormattedAmount(),
          value: money.getAmount(),
        },
      };
    });
  }
}

export default ListInvestments;
