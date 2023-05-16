import { Result } from '../Commons/Result';
import { TransactionEvent } from './Events/TransactionEvent';

export interface TransactionRepositoryInterface {
  publish(event: TransactionEvent): Promise<Result>;

  transactionRepositoryInterfaceGuard: boolean;
}
