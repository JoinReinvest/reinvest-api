import { Updateable } from 'kysely';
import { reinvestmentTradesTable, TradingDatabaseAdapterProvider } from 'Trading/Adapter/Database/DatabaseAdapter';
import { ReinvestmentTradesTable } from 'Trading/Adapter/Database/TradingSchema';
import {
  ReinvestmentTrade,
  ReinvestmentTradeConfiguration,
  ReinvestmentTradeSchema,
  ReinvestmentVendorsConfiguration
} from "Trading/Domain/ReinvestmentTrade";
import { SharesTransferState, VendorsConfiguration, VertaloDistributionState, VertaloPaymentState } from 'Trading/Domain/Trade';

export class ReinvestmentRepository {
  private databaseAdapterProvider: TradingDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: TradingDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'ReinvestmentRepository';

  async getOrCreateTradeByDividendId(tradeConfiguration: ReinvestmentTradeConfiguration): Promise<ReinvestmentTrade> {
    const { dividendId } = tradeConfiguration;
    const trade = await this.getTradeByDividendId(dividendId);

    if (!trade) {
      return this.createTrade(tradeConfiguration);
    }

    return trade as unknown as ReinvestmentTrade;
  }

  async getTradeByDividendId(dividendId: string): Promise<ReinvestmentTrade | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(reinvestmentTradesTable)
      .select(['dividendId', 'sharesTransferJson', 'tradeConfigurationJson', 'vendorsConfigurationJson', 'vertaloDistributionStateJson', 'vertaloPaymentJson'])
      .where('dividendId', '=', dividendId)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return ReinvestmentTrade.create(this.mapToTradeSchema(data));
  }

  async createTrade(tradeConfiguration: ReinvestmentTradeConfiguration): Promise<ReinvestmentTrade> {
    const { dividendId } = tradeConfiguration;
    await this.databaseAdapterProvider
      .provide()
      .insertInto(reinvestmentTradesTable)
      .values({
        dividendId: dividendId,
        tradeConfigurationJson: tradeConfiguration,
        vendorsConfigurationJson: null,
        vertaloDistributionStateJson: null,
        sharesTransferJson: null,
        vertaloPaymentJson: null,
      })
      .execute();

    return (await this.getTradeByDividendId(dividendId)) as ReinvestmentTrade;
  }

  async updateTrade(trade: ReinvestmentTrade): Promise<void> {
    const dividendId = trade.getDividendId();

    if (!dividendId) {
      throw new Error('DividendId is not set');
    }

    const values = this.mapTradeSchemaToTable(trade.getSchema());

    await this.databaseAdapterProvider.provide().updateTable(reinvestmentTradesTable).set(values).where('dividendId', '=', dividendId).execute();
  }

  private mapToTradeSchema(trade: ReinvestmentTradesTable): ReinvestmentTradeSchema {
    return {
      dividendId: trade.dividendId,
      tradeConfiguration: trade.tradeConfigurationJson as ReinvestmentTradeConfiguration,
      vendorsConfiguration: trade.vendorsConfigurationJson as ReinvestmentVendorsConfiguration,
      vertaloDistributionState: trade.vertaloDistributionStateJson as VertaloDistributionState,
      sharesTransferState: trade.sharesTransferJson as unknown as SharesTransferState,
      vertaloPaymentState: trade.vertaloPaymentJson as unknown as VertaloPaymentState,
    };
  }

  private mapTradeSchemaToTable(schema: ReinvestmentTradeSchema): Updateable<ReinvestmentTradesTable> {
    return {
      tradeConfigurationJson: schema.tradeConfiguration,
      vendorsConfigurationJson: schema.vendorsConfiguration,
      vertaloDistributionStateJson: schema.vertaloDistributionState,
      // @ts-ignore
      sharesTransferJson: schema.sharesTransferState,
      // @ts-ignore
      vertaloPaymentJson: schema.vertaloPaymentState,
    };
  }
}
