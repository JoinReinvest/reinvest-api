import { Result } from 'Investments/Domain/TransactionModeled/Commons/Result';
import { TransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';

export interface TransactionRepositoryInterface {
  publish(event: TransactionEvent): Promise<Result>;

  transactionRepositoryInterfaceGuard: boolean;
}
