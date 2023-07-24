import { UUID } from 'HKEKTypes/Generics';
import { PushReinvestment } from 'Investments/Application/UseCases/PushReinvestment';
import { PushTransaction } from 'Investments/Application/UseCases/PushTransaction';

export class TransactionController {
  private pushTransactionUseCase: PushTransaction;
  private pushReinvestmentUseCase: PushReinvestment;

  constructor(pushTransactionUseCase: PushTransaction, pushReinvestmentUseCase: PushReinvestment) {
    this.pushTransactionUseCase = pushTransactionUseCase;
    this.pushReinvestmentUseCase = pushReinvestmentUseCase;
  }

  public static getClassName = (): string => 'TransactionController';

  async pushTransaction(transactionId: UUID): Promise<void> {
    await this.pushTransactionUseCase.execute(transactionId);
  }

  async pushReinvestment(dividendId: UUID): Promise<void> {
    await this.pushReinvestmentUseCase.execute(dividendId);
  }
}
