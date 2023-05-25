import { SharesServiceInterface } from 'Investments/Application/DomainEventHandler/SharesServiceInterface';
import { TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';

export class SharesEventHandler {
  private sharesAndDividendsModule: SharesServiceInterface;

  constructor(sharesAndDividendsModule: SharesServiceInterface) {
    this.sharesAndDividendsModule = sharesAndDividendsModule;
  }

  static getClassName = (): string => 'SharesEventHandler';

  async handle(event: TransactionEvent): Promise<void> {
    const investmentId = event.id;

    switch (event.kind) {
      case TransactionEvents.INVESTMENT_CREATED:
        const { portfolioId, profileId, accountId, amount } = event.data;
        await this.sharesAndDividendsModule.createShares(portfolioId, profileId, accountId, investmentId, amount);
        break;
    }
  }
}
