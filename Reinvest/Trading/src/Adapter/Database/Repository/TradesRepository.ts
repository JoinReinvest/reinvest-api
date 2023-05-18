import { tradesTable, TradingDatabaseAdapterProvider } from 'Trading/Adapter/Database/DatabaseAdapter';
import { Trade, TradeConfiguration } from 'Trading/Domain/Trade';

export class TradesRepository {
  private databaseAdapterProvider: TradingDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: TradingDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'TradesRepository';

  async getOrCreateTradeByInvestmentId(tradeConfiguration: TradeConfiguration): Promise<Trade | null> {
    const { investmentId } = tradeConfiguration;

    const trade = this.getTradeByInvestmentId(investmentId);

    if (!trade) {
      return this.createTrade(tradeConfiguration);
    }

    return trade;
  }

  async getTradeByInvestmentId(investmentId: string): Promise<Trade | null> {
    const trade = await this.databaseAdapterProvider
      .provide()
      .selectFrom(tradesTable)
      .select(['investmentId', 'tradeConfiguration', 'vendorIds'])
      .where('investmentId', '=', investmentId)
      .executeTakeFirst();

    if (!trade) {
      return null;
    }

    return Trade.create(trade);
  }

  async createTrade(tradeConfiguration: TradeConfiguration): Promise<Trade | null> {
    const { investmentId } = tradeConfiguration;
    const trade = await this.databaseAdapterProvider
      .provide()
      .insertInto(tradesTable)
      .values({
        investmentId: investmentId,
        tradeConfigurationJson: tradeConfiguration,
        vendorIdsJson: null,
        northCapitalTradeStateJson: null,
        vertaloDistributionStateJson: null,
        subscriptionAgreementStateJson: null,
        fundsMoveStateJson: null,
      })
      .execute();

    return this.getTradeByInvestmentId(investmentId);
  }
}
