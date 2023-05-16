import { Result } from '../../Commons/Result';
import { TransactionCreated } from '../../Domain/Events/TransactionCreated';
import { TransactionException } from '../../Domain/TransactionException';
import { TransactionRepositoryInterface } from '../../Domain/TransactionRepositoryInterface';
import { TransactionId } from '../../Domain/ValueObject/TransactionId';
import { UniqueIdGenerator } from '../Tools/UniqueIdGenerator';
import { InitializeTransactionCommand } from './InitializeTransactionCommand';

export class InitializeTransaction {
  private transactionRepository: TransactionRepositoryInterface;
  private idGenerator: UniqueIdGenerator;

  constructor(transactionRepository: TransactionRepositoryInterface, idGenerator: UniqueIdGenerator) {
    this.transactionRepository = transactionRepository;
    this.idGenerator = idGenerator;
  }

  public async execute(command: InitializeTransactionCommand) {
    const transactionCreated = new TransactionCreated(
      TransactionId.fromUniqueId(this.idGenerator.create()),
      command.portfolioId,
      command.investorAccountId,
      command.amountToInvest,
    );

    try {
      await this.transactionRepository.publish(transactionCreated);
    } catch (exception: TransactionException | unknown) {
      // TODO handle it
      return Result.Failure;
    }

    return Result.Success;
  }
}
