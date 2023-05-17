import { InvestmentCreated } from 'Investments/Domain/Transaction/TransactionEvents';
import { TransactionRepositoryInterface } from 'Investments/Domain/TransactionModeled/TransactionRepositoryInterface';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';

export class InvestmentCreatedHandler implements EventHandler<InvestmentCreated> {
  private transactionRepository: TransactionRepositoryInterface;

  constructor(transactionRepository: TransactionRepositoryInterface) {
    this.transactionRepository = transactionRepository;
  }

  static getClassName = (): string => 'InvestmentCreatedHandler';

  async handle(event: InvestmentCreated): Promise<void> {
    console.log(event);
  }
}
