import { Updateable } from 'kysely';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { tradesTable, TradingDatabaseAdapterProvider } from 'Trading/Adapter/Database/DatabaseAdapter';
import { TradesTable } from 'Trading/Adapter/Database/TradingSchema';
import {
  CancelTradeState,
  DisbursementState,
  FundsMoveState,
  NorthCapitalTradeState,
  SharesTransferState,
  SubscriptionAgreementState,
  Trade,
  TradeConfiguration,
  TradeSchema,
  VendorsConfiguration,
  VertaloDistributionState,
  VertaloPaymentState,
} from 'Trading/Domain/Trade';

export class TradesRepository {
  private databaseAdapterProvider: TradingDatabaseAdapterProvider;
  private eventBus: EventBus;

  constructor(databaseAdapterProvider: TradingDatabaseAdapterProvider, eventBus: EventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.eventBus = eventBus;
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
        'sharesTransferJson',
        'disbursementJson',
        'tradeId',
        'vertaloPaymentJson',
        'cancelTradeJson',
        'retryPaymentStateJson',
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
        sharesTransferJson: null,
        disbursementJson: null,
        tradeId: null,
        vertaloPaymentJson: null,
        cancelTradeJson: null,
        retryPaymentStateJson: null,
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
      tradeId: trade.tradeId,
      tradeConfiguration: trade.tradeConfigurationJson as TradeConfiguration,
      vendorsConfiguration: trade.vendorsConfigurationJson as VendorsConfiguration,
      northCapitalTradeState: trade.northCapitalTradeStateJson as NorthCapitalTradeState,
      vertaloDistributionState: trade.vertaloDistributionStateJson as VertaloDistributionState,
      fundsMoveState: trade.fundsMoveStateJson as FundsMoveState,
      subscriptionAgreementState: trade.subscriptionAgreementStateJson as SubscriptionAgreementState,
      disbursementState: trade.disbursementJson as unknown as DisbursementState,
      sharesTransferState: trade.sharesTransferJson as unknown as SharesTransferState,
      vertaloPaymentState: trade.vertaloPaymentJson as unknown as VertaloPaymentState,
      cancelTradeState: trade.cancelTradeJson as unknown as CancelTradeState,
      retryPaymentState: trade.retryPaymentStateJson as unknown as FundsMoveState,
    };
  }

  private mapTradeSchemaToTable(schema: TradeSchema): Updateable<TradesTable> {
    return {
      tradeId: schema.tradeId,
      tradeConfigurationJson: schema.tradeConfiguration,
      // @ts-ignore
      vendorsConfigurationJson: schema.vendorsConfiguration,
      fundsMoveStateJson: schema.fundsMoveState,
      northCapitalTradeStateJson: schema.northCapitalTradeState,
      subscriptionAgreementStateJson: schema.subscriptionAgreementState,
      vertaloDistributionStateJson: schema.vertaloDistributionState,
      retryPaymentStateJson: schema.retryPaymentState,
      // @ts-ignore
      disbursementJson: schema.disbursementState,
      // @ts-ignore
      sharesTransferJson: schema.sharesTransferState,
      // @ts-ignore
      vertaloPaymentJson: schema.vertaloPaymentState,
      // @ts-ignore
      cancelTradeJson: schema.cancelTradeState,
    };
  }

  async getTradeByTradeId(tradeId: string): Promise<Trade | null> {
    const data = await this.databaseAdapterProvider.provide().selectFrom(tradesTable).selectAll().where('tradeId', '=', tradeId).executeTakeFirst();

    if (!data) {
      return null;
    }

    return Trade.create(this.mapToTradeSchema(data));
  }

  async publishEvent(event: DomainEvent): Promise<void> {
    await this.eventBus.publish(event);
  }
}
