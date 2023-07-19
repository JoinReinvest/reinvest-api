import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DateTime } from 'Money/DateTime';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { DividendsRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/DividendsRequestsRepository';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsRepository';
import { Withdrawal, WithdrawalsStatuses } from 'Withdrawals/Domain/Withdrawal';

import { WithdrawalsDatabase } from '../Adapter/Database/DatabaseAdapter';
import { WithdrawalsDocumentsTypes } from '../Domain/WithdrawalsDocuments';
import CreateWithdrawalDocument from './CreateWithdrawalDocument';

class CreateWithdrawal {
  static getClassName = (): string => 'CreateWithdrawal';

  private readonly withdrawalsRepository: WithdrawalsRepository;
  private readonly fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;
  private readonly dividendsRequestsRepository: DividendsRequestsRepository;
  private readonly createWithdrawalDocument: CreateWithdrawalDocument;
  private transactionAdapter: TransactionalAdapter<WithdrawalsDatabase>;
  private readonly idGenerator: IdGeneratorInterface;

  constructor(
    withdrawalsRepository: WithdrawalsRepository,
    fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository,
    dividendsRequestsRepository: DividendsRequestsRepository,
    createWithdrawalDocument: CreateWithdrawalDocument,
    transactionAdapter: TransactionalAdapter<WithdrawalsDatabase>,
    idGenerator: IdGeneratorInterface,
  ) {
    this.withdrawalsRepository = withdrawalsRepository;
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
    this.dividendsRequestsRepository = dividendsRequestsRepository;
    this.createWithdrawalDocument = createWithdrawalDocument;
    this.transactionAdapter = transactionAdapter;
    this.idGenerator = idGenerator;
  }

  async execute() {
    const id = this.idGenerator.createUuid();
    const redemptionId = this.idGenerator.createUuid();
    const payoutId = this.idGenerator.createUuid();

    const dividends = await this.dividendsRequestsRepository.getAllAcceptedDividendsRequests();
    const withdrawals = await this.fundsWithdrawalRequestsRepository.getAllAcceptedWithdrawalRequests();

    const listOfDividends = { list: dividends.map(el => el.getId()) };
    const listOfWithdrawals = { list: withdrawals.map(el => el.getId()) };

    const withdrawal = Withdrawal.create({
      dateCompleted: null,
      dateCreated: DateTime.now(),
      id,
      listOfDividends,
      listOfWithdrawals,
      payoutId,
      redemptionId,
      status: WithdrawalsStatuses.PENDING,
    });

    await this.transactionAdapter.transaction(`Create withdrawal and assign id to withdrawals and dividends `, async () => {
      await this.withdrawalsRepository.create(withdrawal);

      for (const withdrawal of withdrawals) {
        withdrawal.assignWithdrawalId(id);
        await this.fundsWithdrawalRequestsRepository.assignWithdrawalId(withdrawal);
      }

      for (const dividend of dividends) {
        dividend.assignWithdrawalId(id);
        await this.dividendsRequestsRepository.assignWithdrawalId(dividend);
      }
    });

    if (listOfWithdrawals.list.length) {
      const isRedemptionCreated = await this.createWithdrawalDocument.execute(redemptionId, WithdrawalsDocumentsTypes.REDEMPTION, listOfWithdrawals);

      if (!isRedemptionCreated) {
        return false;
      }
    }

    if (listOfDividends.list.length) {
      const isPayoutCreated = await this.createWithdrawalDocument.execute(redemptionId, WithdrawalsDocumentsTypes.PAYOUT, listOfDividends);

      if (!isPayoutCreated) {
        return false;
      }
    }

    return id;
  }
}

export default CreateWithdrawal;
