import { SharesServiceInterface } from 'Investments/Application/DomainEventHandler/SharesServiceInterface';
import {
  DividendReinvestmentRequested,
  ReinvestmentEvent,
  ReinvestmentEvents,
  SharesTransferredForReinvestment,
} from 'Investments/Domain/Reinvestments/ReinvestmentEvents';
import { TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';

export class SharesEventHandler {
  private sharesAndDividendsModule: SharesServiceInterface;

  constructor(sharesAndDividendsModule: SharesServiceInterface) {
    this.sharesAndDividendsModule = sharesAndDividendsModule;
  }

  static getClassName = (): string => 'SharesEventHandler';

  async handle(event: TransactionEvent | ReinvestmentEvent): Promise<void> {
    const objectId = event.id; // investment id or dividend id

    switch (event.kind) {
      case TransactionEvents.INVESTMENT_CREATED:
        const { portfolioId, profileId, accountId, amount } = event.data;
        await this.sharesAndDividendsModule.createShares(portfolioId, profileId, accountId, objectId, amount, 'INVESTMENT');
        break;
      case TransactionEvents.TRADE_CREATED:
        const { shares, unitSharePrice } = event.data;
        await this.sharesAndDividendsModule.fundingShares(objectId, shares, unitSharePrice);
        break;
      case TransactionEvents.INVESTMENT_FUNDED:
        await this.sharesAndDividendsModule.sharesFunded(objectId);
        break;
      case TransactionEvents.INVESTMENT_SHARES_TRANSFERRED:
        await this.sharesAndDividendsModule.sharesSettled(objectId);
        break;
      case TransactionEvents.TRANSACTION_CANCELED:
      case TransactionEvents.TRANSACTION_REVERTED:
      case TransactionEvents.TRANSACTION_CANCELED_UNWINDING:
      case TransactionEvents.TRANSACTION_REVERTED_UNWINDING:
        await this.sharesAndDividendsModule.sharesRevoked(objectId);
        break;
      case ReinvestmentEvents.DIVIDEND_REINVESTMENT_REQUESTED:
        const {
          portfolioId: reinvestmentPortfolioId,
          profileId: reinvestmentProfileId,
          accountId: reinvestmentAccountId,
          amount: reinvestmentAmount,
        } = (<DividendReinvestmentRequested>event).data;

        await this.sharesAndDividendsModule.createShares(
          reinvestmentPortfolioId,
          reinvestmentProfileId,
          reinvestmentAccountId,
          objectId,
          reinvestmentAmount,
          'DIVIDEND',
        );
        await this.sharesAndDividendsModule.markDividendReinvested(reinvestmentProfileId, reinvestmentAccountId, objectId);
        break;
      case ReinvestmentEvents.SHARES_TRANSFERRED_FOR_REINVESTMENT:
        const { numberOfShares: reinvestmentNumberOfShares, unitPrice: reinvestmentUnitSharePrice } = (<SharesTransferredForReinvestment>event).data;

        await this.sharesAndDividendsModule.fundingShares(objectId, reinvestmentNumberOfShares, reinvestmentUnitSharePrice);
        await this.sharesAndDividendsModule.sharesFunded(objectId);
        await this.sharesAndDividendsModule.sharesSettled(objectId);
        break;
    }
  }
}
