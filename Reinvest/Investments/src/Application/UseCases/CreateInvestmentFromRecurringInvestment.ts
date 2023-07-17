import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { Investment } from 'Investments/Domain/Investments/Investment';
import { RecurringInvestmentExecution } from 'Investments/Domain/Investments/RecurringInvestmentExecution';
import { Origin } from 'Investments/Domain/Investments/Types';
import { InvestmentFeeService } from 'Investments/Domain/Service/InvestmentFeeService';
import { InvestmentCreated, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { PortfolioService } from 'Investments/Infrastructure/Adapters/Modules/PortfolioService';
import { InvestmentsDatabase } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { RecurringInvestmentExecutionRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestmentExecutionRepository';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import TradeId from 'Investments/Infrastructure/ValueObject/TradeId';
import { DateTime } from 'Money/DateTime';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class CreateInvestmentFromRecurringInvestment {
  static getClassName = (): string => 'CreateInvestmentFromRecurringInvestment';

  private recurringInvestmentsRepository: RecurringInvestmentsRepository;
  private idGenerator: IdGeneratorInterface;
  private investmentRepository: InvestmentsRepository;
  private transactionAdapter: TransactionalAdapter<InvestmentsDatabase>;
  private feeService: InvestmentFeeService;
  private recurringInvestmentExecutionRepository: RecurringInvestmentExecutionRepository;
  private portfolioService: PortfolioService;

  constructor(
    recurringInvestmentsRepository: RecurringInvestmentsRepository,
    recurringInvestmentExecutionRepository: RecurringInvestmentExecutionRepository,
    investmentRepository: InvestmentsRepository,
    feeService: InvestmentFeeService,
    transactionAdapter: TransactionalAdapter<InvestmentsDatabase>,
    idGenerator: IdGeneratorInterface,
    portfolioService: PortfolioService,
  ) {
    this.feeService = feeService;
    this.recurringInvestmentExecutionRepository = recurringInvestmentExecutionRepository;
    this.investmentRepository = investmentRepository;
    this.transactionAdapter = transactionAdapter;
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
    this.idGenerator = idGenerator;
    this.portfolioService = portfolioService;
  }

  async execute(recurringInvestmentId: UUID, bankAccountId: UUID, parentId: UUID | null): Promise<void> {
    const recurringInvestment = await this.recurringInvestmentsRepository.getRecurringInvestmentById(recurringInvestmentId);

    if (!recurringInvestment || !recurringInvestment.isActive()) {
      return;
    }

    const lastExecution = await this.recurringInvestmentExecutionRepository.getLastRecurringInvestmentExecution(recurringInvestmentId);
    const lastExecutionDate = lastExecution ? lastExecution.getExecutionDate() : null;

    if (!recurringInvestment.canBeExecuted(lastExecutionDate)) {
      return;
    }

    const thisExecutionDate = recurringInvestment.getNextExecutionDate(lastExecutionDate);
    recurringInvestment.setNextExecutionDate(thisExecutionDate);

    const investmentId = this.idGenerator.createUuid();
    const tradeId = this.idGenerator.createNumericId(TradeId.getTradeIdSize());
    const { amount, profileId, accountId, portfolioId, subscriptionAgreementId } = recurringInvestment.toObject();
    const unitPrice = await this.portfolioService.getCurrentSharePrice(portfolioId);

    const investment = Investment.create(
      investmentId,
      amount,
      profileId,
      accountId,
      bankAccountId,
      portfolioId,
      tradeId,
      Origin.SCHEDULER,
      recurringInvestmentId,
      parentId,
      subscriptionAgreementId,
      null,
      unitPrice,
    );

    const recurringInvestmentExecutionId = this.idGenerator.createUuid();
    const currentInvestmentExecution = RecurringInvestmentExecution.create(
      recurringInvestmentExecutionId,
      recurringInvestmentId,
      investmentId,
      thisExecutionDate,
    );

    const events: DomainEvent[] = [
      <InvestmentCreated>{
        id: investmentId,
        kind: TransactionEvents.INVESTMENT_CREATED,
        date: DateTime.now().toDate(),
        data: {
          profileId,
          accountId: accountId,
          portfolioId: portfolioId,
          parentId: parentId,
          amount: amount.getAmount(),
        },
      },
      storeEventCommand(profileId, 'RecurringInvestmentProcessStarted', {
        accountId: accountId,
        amount: amount.getAmount(),
        tradeId: tradeId,
        origin: Origin.SCHEDULER,
        investmentId: investmentId,
      }),
    ];

    await this.transactionAdapter.transaction(`Create investment ${investmentId} from recurring investment ${recurringInvestmentId}`, async () => {
      const fee = await this.feeService.calculateFee(amount, profileId, accountId, investmentId);

      if (fee) {
        investment.setFee(fee);
      }

      investment.startInvestment(true);
      await this.recurringInvestmentsRepository.store(recurringInvestment);
      await this.investmentRepository.store(investment);
      await this.recurringInvestmentExecutionRepository.store(currentInvestmentExecution);

      await this.investmentRepository.publishEvents(events);
    });
  }
}
