import { Result } from 'Investments/Domain/TransactionModeled/Commons/Result';
import { TransactionCreated } from 'Investments/Domain/TransactionModeled/Events/TransactionCreated';
import { TransactionException } from 'Investments/Domain/TransactionModeled/TransactionException';
import { TransactionRepositoryInterface } from 'Investments/Domain/TransactionModeled/TransactionRepositoryInterface';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';

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
