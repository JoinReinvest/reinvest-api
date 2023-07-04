import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { Fee, VerificationFeeIds } from 'Investments/Domain/Investments/Fee';
import { Investment } from 'Investments/Domain/Investments/Investment';
import { InvestmentStatus, Origin } from 'Investments/Domain/Investments/Types';
import { VerificationService } from 'Investments/Infrastructure/Adapters/Modules/VerificationService';
import { InvestmentsDatabase } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { FeesRepository } from 'Investments/Infrastructure/Adapters/Repository/FeesRepository';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import TradeId from 'Investments/Infrastructure/ValueObject/TradeId';
import { Money } from 'Money/Money';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';

export type InvestmentCreate = {
  accountId: string;
  bankAccountId: string;
  id: string;
  origin: Origin;
  parentId: string | null;
  portfolioId: string;
  profileId: string;
  status: InvestmentStatus;
  tradeId: string;
};

class CreateInvestment {
  static getClassName = (): string => 'CreateInvestment';
  private verificationService: VerificationService;
  private feeRepository: FeesRepository;
  private investmentsRepository: InvestmentsRepository;
  private idGenerator: IdGeneratorInterface;
  private transactionalAdapter: TransactionalAdapter<InvestmentsDatabase>;

  constructor(
    investmentsRepository: InvestmentsRepository,
    feeRepository: FeesRepository,
    verificationService: VerificationService,
    idGenerator: IdGeneratorInterface,
    transactionalAdapter: TransactionalAdapter<InvestmentsDatabase>,
  ) {
    this.verificationService = verificationService;
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
    const fee = await this.calculateFee(amount, profileId, parentId ?? accountId, investmentId);

    if (fee) {
      investment.setFee(fee);
    }

    await this.investmentsRepository.store(investment);

    return investmentId;
  }

  private async calculateFee(amount: Money, profileId: UUID, accountId: UUID, investmentId: UUID): Promise<Fee | null> {
    const fees = await this.verificationService.payFeesForInvestment(amount, profileId, accountId);

    if (fees.length === 0) {
      return null;
    }

    let feeAmount = Money.zero();
    const feesReferences: VerificationFeeIds = {
      fees: [],
    };

    for (const fee of fees) {
      feeAmount = feeAmount.add(fee.amount);
      feesReferences.fees.push({
        amount: fee.amount.getAmount(),
        verificationFeeId: fee.verificationFeeId,
      });
    }

    if (feeAmount.isZero()) {
      return null;
    }

    const feeId = this.idGenerator.createUuid();

    return Fee.create(accountId, feeAmount, feeId, investmentId, profileId, feesReferences);
  }
}

export default CreateInvestment;
