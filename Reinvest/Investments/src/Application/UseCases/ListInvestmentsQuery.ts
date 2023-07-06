import { UUID } from 'HKEKTypes/Generics';
import { Investment } from 'Investments/Domain/Investments/Investment';
import { InvestmentStatus } from 'Investments/Domain/Investments/Types';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { Pagination } from 'Reinvest/Investments/src/Application/Pagination';

export type InvestmentOverview = {
  amount: {
    formatted: string;
    value: number;
  };
  createdAt: string;
  id: UUID;
  status: InvestmentStatus;
  tradeId: string;
};

class ListInvestmentsQuery {
  private readonly investmentsRepository: InvestmentsRepository;

  constructor(investmentsRepository: InvestmentsRepository) {
    this.investmentsRepository = investmentsRepository;
  }

  static getClassName = (): string => 'ListInvestmentsQuery';

  async listAllInvestments(profileId: string, accountId: string, pagination: Pagination): Promise<InvestmentOverview[]> {
    const investments = await this.investmentsRepository.listPaginatedInvestmentsWithoutFee(profileId, accountId, pagination);

    return investments.map((investment: Investment): InvestmentOverview => {
      const { id, tradeId, dateCreated, amount, status } = investment.toObject();

      return {
        id,
        tradeId,
        createdAt: dateCreated.toIsoDateTime(),
        status,
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
