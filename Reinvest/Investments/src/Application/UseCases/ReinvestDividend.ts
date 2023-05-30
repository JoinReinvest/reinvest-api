import { ReinvestmentEvents } from 'Investments/Domain/Reinvestments/ReinvestmentEvents';
import { SharesAndDividendService } from 'Investments/Infrastructure/Adapters/Modules/SharesAndDividendService';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';

export class ReinvestDividend {
  private sharesAndDividendsService: SharesAndDividendService;
  private eventBus: EventBus;

  constructor(sharesAndDividendsService: SharesAndDividendService, eventBus: EventBus) {
    this.sharesAndDividendsService = sharesAndDividendsService;
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'ReinvestDividend';

  async execute(profileId: string, accountId: string, portfolioId: string, dividendId: string): Promise<boolean> {
    const dividend = await this.sharesAndDividendsService.getDividend(profileId, dividendId);

    // todo uncomment it!
    if (!dividend) {
      // || dividend.status !== 'PENDING') {
      return false;
    }

    await this.eventBus.publish({
      kind: ReinvestmentEvents.DIVIDEND_REINVESTMENT_REQUESTED,
      id: dividend.id,
      data: {
        profileId: profileId,
        accountId: accountId,
        amount: dividend.amount.value,
        portfolioId,
      },
    });

    return true;
  }
}
