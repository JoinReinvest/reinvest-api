import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { Investment } from 'Investments/Domain/Investments/Investment';
import { Origin } from 'Investments/Domain/Investments/Types';
import { InvestmentFeeService } from 'Investments/Domain/Service/InvestmentFeeService';
import { InvestmentsDatabase } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { FeesRepository } from 'Investments/Infrastructure/Adapters/Repository/FeesRepository';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import TradeId from 'Investments/Infrastructure/ValueObject/TradeId';
import { Money } from 'Money/Money';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';

export class CreateInvestment {
  static getClassName = (): string => 'CreateInvestment';
  private feeRepository: FeesRepository;
  private investmentsRepository: InvestmentsRepository;
  private idGenerator: IdGeneratorInterface;
  private transactionalAdapter: TransactionalAdapter<InvestmentsDatabase>;
  private feeService: InvestmentFeeService;

  constructor(
    investmentsRepository: InvestmentsRepository,
    feeRepository: FeesRepository,
    feeService: InvestmentFeeService,
    idGenerator: IdGeneratorInterface,
    transactionalAdapter: TransactionalAdapter<InvestmentsDatabase>,
  ) {
    this.feeService = feeService;
    this.feeRepository = feeRepository;
    this.investmentsRepository = investmentsRepository;
    this.idGenerator = idGenerator;
    this.transactionalAdapter = transactionalAdapter;
  }

  async execute(portfolioId: UUID, profileId: UUID, accountId: UUID, bankAccountId: UUID, amount: Money, parentId: UUID | null) {
    const investmentId = this.idGenerator.createUuid();
    const tradeId = this.idGenerator.createNumericId(TradeId.getTradeIdSize());

    const investment = Investment.create(
      investmentId,
      amount,
      profileId,
      accountId,
      bankAccountId,
      portfolioId,
      tradeId,
      Origin.DIRECT,
      null,
      parentId,
      null,
      null,
    );
    const fee = await this.feeService.calculateFee(amount, profileId, parentId ?? accountId, investmentId);

    if (fee) {
      investment.setFee(fee);
    }

    await this.investmentsRepository.store(investment);

    return investmentId;
  }
}
