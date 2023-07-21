import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { DomainEvent } from 'SimpleAggregator/Types';
import { WithdrawalsDatabase } from 'Withdrawals/Adapter/Database/DatabaseAdapter';
import { DividendsRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/DividendsRequestsRepository';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsRepository';
import { Withdrawal, WithdrawalsEvents } from 'Withdrawals/Domain/Withdrawal';

class CreateWithdrawal {
  static getClassName = (): string => 'CreateWithdrawal';

  private readonly withdrawalsRepository: WithdrawalsRepository;
  private readonly fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;
  private readonly dividendsRequestsRepository: DividendsRequestsRepository;
  private transactionAdapter: TransactionalAdapter<WithdrawalsDatabase>;
  private readonly idGenerator: IdGeneratorInterface;

  constructor(
    withdrawalsRepository: WithdrawalsRepository,
    fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository,
    dividendsRequestsRepository: DividendsRequestsRepository,
    transactionAdapter: TransactionalAdapter<WithdrawalsDatabase>,
    idGenerator: IdGeneratorInterface,
  ) {
    this.withdrawalsRepository = withdrawalsRepository;
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
    this.dividendsRequestsRepository = dividendsRequestsRepository;
    this.transactionAdapter = transactionAdapter;
    this.idGenerator = idGenerator;
  }

  async execute() {
    const events: DomainEvent[] = [];

    const dividends = await this.dividendsRequestsRepository.getAllAcceptedDividendsRequests();
    const withdrawals = await this.fundsWithdrawalRequestsRepository.getAllAcceptedWithdrawalRequests();

    if (dividends.length === 0 && withdrawals.length === 0) {
      throw new Error('No withdrawals requests or dividends to create withdrawal');
    }

    const listOfDividends = { list: dividends.map(el => el.getId()) };
    const listOfWithdrawals = { list: withdrawals.map(el => el.getId()) };
    const id = this.idGenerator.createUuid();
    const redemptionId = this.idGenerator.createUuid();
    const payoutId = this.idGenerator.createUuid();

    const withdrawal = Withdrawal.create(id, payoutId, redemptionId, listOfDividends, listOfWithdrawals);

    const status = await this.transactionAdapter.transaction(`Create withdrawal and assign id to withdrawals and dividends `, async () => {
      await this.withdrawalsRepository.store(withdrawal);

      for (const withdrawal of withdrawals) {
        withdrawal.assignWithdrawalId(id);
        await this.fundsWithdrawalRequestsRepository.assignWithdrawalId(withdrawal);
      }

      for (const dividend of dividends) {
        dividend.assignWithdrawalId(id);
        await this.dividendsRequestsRepository.assignWithdrawalId(dividend);
      }
    });

    if (status === false) {
      throw new Error('Cannot create withdrawal');
    }

    events.push({
      id,
      kind: WithdrawalsEvents.WithdrawalCreated,
      data: {
        withdrawalId: id,
      },
    });

    await this.withdrawalsRepository.publishEvents(events);

    return id;
  }
}

export default CreateWithdrawal;
