import { InvestmentFeeService } from 'Investments/Domain/Service/InvestmentFeeService';
import { InvestmentsDatabase } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';

class AbortInvestment {
  private readonly investmentsRepository: InvestmentsRepository;
  private investmentFeeService: InvestmentFeeService;
  private transactionAdapter: TransactionalAdapter<InvestmentsDatabase>;

  constructor(
    investmentsRepository: InvestmentsRepository,
    investmentFeeService: InvestmentFeeService,
    transactionAdapter: TransactionalAdapter<InvestmentsDatabase>,
  ) {
    this.investmentsRepository = investmentsRepository;
    this.investmentFeeService = investmentFeeService;
    this.transactionAdapter = transactionAdapter;
  }

  static getClassName = (): string => 'AbortInvestment';

  async execute(profileId: string, investmentId: string) {
    try {
      const investment = await this.investmentsRepository.getInvestmentByProfileAndId(profileId, investmentId);

      if (!investment) {
        return false;
      }

      return await this.transactionAdapter.transaction(`Abort transaction ${investmentId}`, async () => {
        investment.abort();
        await this.investmentFeeService.withdrawFee(investment.getFee());
        await this.investmentsRepository.store(investment);
      });
    } catch (e) {
      console.log(e);

      return false;
    }
  }
}

export default AbortInvestment;
