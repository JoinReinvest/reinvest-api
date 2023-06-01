import { TransactionRepositoryInterface } from 'Investments/Application/Repository/TransactionRepositoryInterface';
import { TransactionExecutor } from 'Investments/Application/TransactionProcessManager/TransactionExecutor';

export class PushTransaction {
  private transactionRepository: TransactionRepositoryInterface;
  private transactionExecutor: TransactionExecutor;

  constructor(transactionRepository: TransactionRepositoryInterface, transactionExecutor: TransactionExecutor) {
    this.transactionRepository = transactionRepository;
    this.transactionExecutor = transactionExecutor;
  }

  static getClassName = (): string => 'PushTransaction';

  async execute(transactionId: string) {
    try {
      const transaction = await this.transactionRepository.restoreTransaction(transactionId);

      await this.transactionExecutor.execute(transaction);
    } catch (error) {
      console.error(error);
    }
  }
}
