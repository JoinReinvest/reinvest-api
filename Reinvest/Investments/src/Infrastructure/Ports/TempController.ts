import { InvestmentCreated, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';

export class TempController {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public static getClassName = (): string => 'TempController';

  public async handle(): Promise<boolean> {
    const investmentId = 'eaa65468-b21b-4b22-9115-426e3872eaff';
    const accountId = '6a7dd75b-8c65-41dd-af2d-9e6479e1b5c2';
    const profileId = 'aeb8cfdd-67fb-44ee-a562-0113d5e4fec5'; //lukasz@devkick.pl
    await this.eventBus.publish(<InvestmentCreated>{
      id: investmentId,
      kind: TransactionEvents.INVESTMENT_CREATED,
      date: new Date(),
      data: {
        profileId,
        accountId,
      },
    });

    return true;
  }
}
