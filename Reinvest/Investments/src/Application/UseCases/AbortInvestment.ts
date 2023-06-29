import { InvestmentsDatabase } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { FeesRepository } from 'Investments/Infrastructure/Adapters/Repository/FeesRepository';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';

class AbortInvestment {
  private readonly investmentsRepository: InvestmentsRepository;
  private readonly feesRepository: FeesRepository;
  private readonly transactionAdapter: TransactionalAdapter<InvestmentsDatabase>;

  constructor(investmentsRepository: InvestmentsRepository, feesRepository: FeesRepository, transactionAdapter: TransactionalAdapter<InvestmentsDatabase>) {
    this.investmentsRepository = investmentsRepository;
    this.feesRepository = feesRepository;
    this.transactionAdapter = transactionAdapter;
  }

  static getClassName = (): string => 'AbortInvestment';

  async execute(profileId: string, investmentId: string) {
    try {
      const investment = await this.investmentsRepository.getInvestmentByProfileAndId(profileId, investmentId);

      if (!investment) {
        return false;
      }

      investment.abort();

      const status = await this.transactionAdapter.transaction(`Abort investment ${investmentId} with related fee if exist`, async () => {
        await this.investmentsRepository.updateStatus(investment);
        const fee = investment.getFee();

        if (fee) {
          await this.feesRepository.storeFee(fee);
        }
      });

      return status;
    } catch (e) {
      console.log(e);

      return false;
    }
  }
}

export default AbortInvestment;
