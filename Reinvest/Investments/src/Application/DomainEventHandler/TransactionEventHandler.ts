import { InvestmentStatusEventHandler } from 'Investments/Application/DomainEventHandler/InvestmentStatusEventHandler';
import { SharesEventHandler } from 'Investments/Application/DomainEventHandler/SharesEventHandler';
import { TransactionRepositoryInterface } from 'Investments/Application/Repository/TransactionRepositoryInterface';
import { TransactionExecutor } from 'Investments/Application/TransactionProcessManager/TransactionExecutor';
import { TransactionEvent } from 'Investments/Domain/Transaction/TransactionEvents';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';

export class TransactionEventHandler implements EventHandler<TransactionEvent> {
  private transactionRepository: TransactionRepositoryInterface;
  private transactionExecutor: TransactionExecutor;
  private sharesEventHandler: SharesEventHandler;
  private investmentStatusEventHandler: InvestmentStatusEventHandler;

  constructor(
    transactionRepository: TransactionRepositoryInterface,
    transactionExecutor: TransactionExecutor,
    sharesEventHandler: SharesEventHandler,
    investmentStatusEventHandler: InvestmentStatusEventHandler,
  ) {
    this.transactionRepository = transactionRepository;
    this.transactionExecutor = transactionExecutor;
    this.sharesEventHandler = sharesEventHandler;
    this.investmentStatusEventHandler = investmentStatusEventHandler;
  }

  static getClassName = (): string => 'TransactionEventHandler';

  async handle(event: TransactionEvent): Promise<void> {
    try {
      const transaction = await this.transactionRepository.restoreTransaction(event.id);

      if (transaction.handleEvent(event)) {
        await this.sharesEventHandler.handle(event);
        await this.investmentStatusEventHandler.handle(event);
        await this.transactionRepository.saveEvent(event);
      }

      await this.transactionExecutor.execute(transaction);
    } catch (error) {
      console.error(error);
    }
  }
}
