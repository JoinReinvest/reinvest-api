import { PushTransaction } from 'Investments/Application/UseCases/PushTransaction';

export class TransactionController {
  private pushTransactionUseCase: PushTransaction;

  constructor(pushTransactionUseCase: PushTransaction) {
    this.pushTransactionUseCase = pushTransactionUseCase;
  }

  public static getClassName = (): string => 'TransactionController';

  async pushTransaction(transactionId: string): Promise<void> {
    await this.pushTransactionUseCase.execute(transactionId);
  }
}
