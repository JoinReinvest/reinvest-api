import { InvestmentCreated, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';

export class TempController {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public static getClassName = (): string => 'TempController';

  public async handle(): Promise<boolean> {
    const investmentId = 'c147ef0c-1bf5-48eb-9e37-9a1131ea39bc';
    const accountId = '6a7dd75b-8c65-41dd-af2d-9e6479e1b5c2';
    const profileId = 'aeb8cfdd-67fb-44ee-a562-0113d5e4fec5'; //lukasz@devkick.pl
    await this.eventBus.publish(<InvestmentCreated>{
      id: investmentId,
      kind: TransactionEvents.INVESTMENT_CREATED,
      date: new Date(),
      data: {
        profileId,
        accountId,
        portfolioId: 'b1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        amount: 50000,
      },
    });

    return true;
  }
}
