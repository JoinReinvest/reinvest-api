import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { Fee, VerificationFeeIds } from 'Investments/Domain/Investments/Fee';
import { InvestmentStatus, ScheduledBy } from 'Investments/Domain/Investments/Types';
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
  parentId: string | null;
  portfolioId: string;
  profileId: string;
  scheduledBy: ScheduledBy;
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

  async execute(portfolioId: string, profileId: string, accountId: string, bankAccountId: string, money: Money, parentId: string | null) {
    const id = this.idGenerator.createUuid();

    const tradeIdSize = TradeId.getTradeIdSize();

    const investment: InvestmentCreate = {
      id,
      portfolioId,
      profileId,
      bankAccountId,
      accountId,
      scheduledBy: ScheduledBy.DIRECT,
      status: InvestmentStatus.WAITING_FOR_SUBSCRIPTION_AGREEMENT,
      tradeId: this.idGenerator.createNumericId(tradeIdSize),
      parentId,
    };

    const status = this.transactionalAdapter.transaction(`Create investment ${id} with fees for ${profileId}/${accountId}`, async () => {
      await this.investmentsRepository.create(investment, money);
      const fees = await this.verificationService.payFeesForInvestment(money, profileId, accountId);

      if (fees.length === 0) {
        return true;
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
        return true;
      }

      const feeId = this.idGenerator.createUuid();
      const investmentFee = Fee.create(accountId, feeAmount, feeId, id, profileId, feesReferences);
      await this.feeRepository.storeFee(investmentFee);
    });

    if (!status) {
      return false;
    }

    return id;
  }
}

export default CreateInvestment;
