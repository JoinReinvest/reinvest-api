import { Investment } from 'Investments/Domain/Investments/Investment';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { Pagination } from 'Reinvest/Investments/src/Application/Pagination';
import { UUID } from 'HKEKTypes/Generics';

class ListInvestmentsQuery {
  private readonly investmentsRepository: InvestmentsRepository;

  constructor(investmentsRepository: InvestmentsRepository) {
    this.investmentsRepository = investmentsRepository;
  }

  static getClassName = (): string => 'ListInvestmentsQuery';

  async listAllInvestments(profileId: string, accountId: string, pagination: Pagination) {
    const investments = await this.investmentsRepository.getInvestments(profileId, accountId, pagination);

    return investments.map((investment: Investment) => {
      const { id, tradeId, dateCreated, amount } = investment.toObject();

      return {
        id,
        tradeId,
        createdAt: dateCreated,
        amount: {
          formatted: amount.getFormattedAmount(),
          value: amount.getAmount(),
        },
      };
    });
  }

  async getPendingInvestmentsIds(): Promise<UUID[]> {
    return this.investmentsRepository.getPendingInvestmentsIds();
  }
}

export default ListInvestmentsQuery;
