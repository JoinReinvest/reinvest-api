import { InvestmentCreated, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';

export class TempController {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public static getClassName = (): string => 'TempController';

  public async handle(): Promise<boolean> {
    await this.eventBus.publish(<InvestmentCreated>{
      id: '123',
      kind: TransactionEvents.INVESTMENT_CREATED,
      date: new Date(),
      data: {
        amount: 50000,
        fees: 1000,
      },
    });

    return true;
  }
}
