import { Updateable } from 'kysely';
import { tradesTable, TradingDatabaseAdapterProvider } from 'Trading/Adapter/Database/DatabaseAdapter';
import { TradesTable } from 'Trading/Adapter/Database/TradingSchema';
import {
  FundsMoveState,
  NorthCapitalTradeState,
  Trade,
  TradeConfiguration,
  TradeSchema,
  VendorsConfiguration,
  VertaloDistributionState,
} from 'Trading/Domain/Trade';

export class TradesRepository {
  private databaseAdapterProvider: TradingDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: TradingDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'TradesRepository';

  async getOrCreateTradeByInvestmentId(tradeConfiguration: TradeConfiguration): Promise<Trade> {
    const { investmentId } = tradeConfiguration;
    const trade = await this.getTradeByInvestmentId(investmentId);

    if (!trade) {
      return this.createTrade(tradeConfiguration);
    }

    return trade as unknown as Trade;
  }

  async getTradeByInvestmentId(investmentId: string): Promise<Trade | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(tradesTable)
      .select([
        'investmentId',
        'tradeConfigurationJson',
        'vendorsConfigurationJson',
        'fundsMoveStateJson',
        'northCapitalTradeStateJson',
        'subscriptionAgreementStateJson',
        'vertaloDistributionStateJson',
      ])
      .where('investmentId', '=', investmentId)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return Trade.create(this.mapToTradeSchema(data));
  }

  async createTrade(tradeConfiguration: TradeConfiguration): Promise<Trade> {
    const { investmentId } = tradeConfiguration;
    await this.databaseAdapterProvider
      .provide()
      .insertInto(tradesTable)
      .values({
        investmentId: investmentId,
        tradeConfigurationJson: tradeConfiguration,
        vendorsConfigurationJson: null,
        northCapitalTradeStateJson: null,
        vertaloDistributionStateJson: null,
        subscriptionAgreementStateJson: null,
        fundsMoveStateJson: null,
      })
      .execute();

    return (await this.getTradeByInvestmentId(investmentId)) as Trade;
  }

  async updateTrade(trade: Trade): Promise<void> {
    const investmentId = trade.getInvestmentId();

    if (!investmentId) {
      throw new Error('InvestmentId is not set');
    }

    const values = this.mapTradeSchemaToTable(trade.getSchema());

    await this.databaseAdapterProvider.provide().updateTable(tradesTable).set(values).where('investmentId', '=', investmentId).execute();
  }

  private mapToTradeSchema(trade: TradesTable): TradeSchema {
    return {
      investmentId: trade.investmentId,
      tradeConfiguration: trade.tradeConfigurationJson as TradeConfiguration,
      vendorsConfiguration: trade.vendorsConfigurationJson as VendorsConfiguration,
      northCapitalTradeState: trade.northCapitalTradeStateJson as NorthCapitalTradeState,
      vertaloDistributionState: trade.vertaloDistributionStateJson as VertaloDistributionState,
      fundsMoveState: trade.fundsMoveStateJson as FundsMoveState,
    };
  }

  private mapTradeSchemaToTable(schema: TradeSchema): Updateable<TradesTable> {
    return {
      tradeConfigurationJson: schema.tradeConfiguration,
      vendorsConfigurationJson: schema.vendorsConfiguration,
      fundsMoveStateJson: schema.fundsMoveState,
      northCapitalTradeStateJson: schema.northCapitalTradeState,
      subscriptionAgreementStateJson: null,
      vertaloDistributionStateJson: schema.vertaloDistributionState,
    };
  }
}
