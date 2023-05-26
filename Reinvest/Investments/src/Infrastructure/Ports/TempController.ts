import { InvestmentCreated, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';

export class TempController {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public static getClassName = (): string => 'TempController';

  public async handle(): Promise<boolean> {
    const investmentId = 'a7463e35-9b20-4d41-8cb0-861b0f4487a4';
    const accountId = '6a7dd75b-8c65-41dd-af2d-9e6479e1b5c2';
    const profileId = 'aeb8cfdd-67fb-44ee-a562-0113d5e4fec5'; //lukasz@devkick.pl
    await this.eventBus.publish(<InvestmentCreated>{
      id: investmentId,
      kind: TransactionEvents.INVESTMENT_CREATED,
      date: new Date(),
      data: {
        profileId,
        accountId,
        portfolioId: '34ccfe14-dc18-40df-a1d6-04f33b9fa7f4',
        amount: 100000,
      },
    });

    return true;
  }
}
