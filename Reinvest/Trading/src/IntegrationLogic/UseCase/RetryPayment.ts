import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { EventBus, storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';

export class RetryPayment {
  static getClassName = () => 'RetryPayment';

  private tradesRepository: TradesRepository;
  private northCapitalAdapter: TradingNorthCapitalAdapter;
  private eventBus: EventBus;

  constructor(tradesRepository: TradesRepository, northCapitalAdapter: TradingNorthCapitalAdapter, eventBus: EventBus) {
    this.eventBus = eventBus;
    this.tradesRepository = tradesRepository;
    this.northCapitalAdapter = northCapitalAdapter;
  }

  async execute(investmentId: UUID, retryAfterDate: DateTime): Promise<boolean> {
    try {
      if (DateTime.now().isBefore(retryAfterDate)) {
        console.info(`[Trade ${investmentId}]`, `Waiting with payment retry to date: ${retryAfterDate.toIsoDateTime()}`);

        return false;
      }

      const trade = await this.tradesRepository.getTradeByInvestmentId(investmentId);

      if (!trade) {
        throw new Error(`Trade with investmentId ${investmentId} not found`);
      }

      console.info(`[Trade ${investmentId}]`, 'Retry payment process');

      if (!trade.isPaymentRetried()) {
        const { ncAccountId, offeringId, tradeId, bankName, amount, fee, ip, investmentId, userTradeId } = trade.getFundsTransferConfiguration();
        const fundsTransfer = await this.northCapitalAdapter.createFundsTransfer(investmentId, ncAccountId, offeringId, tradeId, bankName, amount, ip);
        trade.setPaymentRetried(fundsTransfer);
        await this.tradesRepository.updateTrade(trade);
        console.info(`[Trade ${investmentId}]`, 'NC funds transfer recreated', fundsTransfer);

        await this.eventBus.publish(
          storeEventCommand(trade.getProfileId(), 'PaymentInitiated', {
            accountId: trade.getReinvestAccountId(),
            investmentId,
            amount: amount.getAmount(),
            fee: fee.getAmount(),
            tradeId: userTradeId,
            date: DateTime.now().toIsoDateTime(),
          }),
        );
      }

      return true;
    } catch (error) {
      console.error(`[Trade ${investmentId}]`, 'Retry payment failed', error);

      return false;
    }
  }
}
