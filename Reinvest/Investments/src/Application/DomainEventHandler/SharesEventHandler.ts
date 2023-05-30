import { SharesServiceInterface } from 'Investments/Application/DomainEventHandler/SharesServiceInterface';
import { ReinvestmentEvent } from 'Investments/Domain/Reinvestments/ReinvestmentEvents';
import { TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';

export class SharesEventHandler {
  private sharesAndDividendsModule: SharesServiceInterface;

  constructor(sharesAndDividendsModule: SharesServiceInterface) {
    this.sharesAndDividendsModule = sharesAndDividendsModule;
  }

  static getClassName = (): string => 'SharesEventHandler';

  async handle(event: TransactionEvent | ReinvestmentEvent): Promise<void> {
    const investmentId = event.id;

    switch (event.kind) {
      case TransactionEvents.INVESTMENT_CREATED:
        const { portfolioId, profileId, accountId, amount } = event.data;
        await this.sharesAndDividendsModule.createShares(portfolioId, profileId, accountId, investmentId, amount);
        break;
      case TransactionEvents.TRADE_CREATED:
        const { shares, unitSharePrice } = event.data;
        await this.sharesAndDividendsModule.fundingShares(investmentId, shares, unitSharePrice);
        break;
      case TransactionEvents.INVESTMENT_FUNDED:
        await this.sharesAndDividendsModule.sharesFunded(investmentId);
        break;
      case TransactionEvents.INVESTMENT_SHARES_TRANSFERRED:
        await this.sharesAndDividendsModule.sharesSettled(investmentId);
        break;
    }
  }
}
