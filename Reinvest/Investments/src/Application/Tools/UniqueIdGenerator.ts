import { UniqueId } from 'Investments/Domain/TransactionModeled/Commons/UniqueId';

export interface UniqueIdGenerator {
  create(): UniqueId;
}
