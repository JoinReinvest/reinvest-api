import { DateTime } from 'Money/DateTime';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { TradingVertaloAdapter } from 'Trading/Adapter/Vertalo/TradingVertaloAdapter';
import { Trade } from 'Trading/Domain/Trade';

export class TransferSharesWhenTradeSettled {
  private tradesRepository: TradesRepository;
  private northCapitalAdapter: TradingNorthCapitalAdapter;
  private vertaloAdapter: TradingVertaloAdapter;

  constructor(tradesRepository: TradesRepository, northCapitalAdapter: TradingNorthCapitalAdapter, vertaloAdapter: TradingVertaloAdapter) {
    this.tradesRepository = tradesRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.vertaloAdapter = vertaloAdapter;
  }

  static getClassName = () => 'TransferSharesWhenTradeSettled';

  async execute(investmentId: string): Promise<boolean> {
    try {
      const trade = await this.tradesRepository.getTradeByInvestmentId(investmentId);

      if (!trade) {
        throw new Error(`Trade ${investmentId} not exists`);
      }

      console.info(`[Trade ${investmentId}]`, 'Transfer shares when trade is settled started');

      const tradeStatus = await this.verifyTradeStatus(trade);

      if (!tradeStatus || !trade.isTradeSettled()) {
        console.info(`[Trade ${investmentId}]`, 'Trade is not settled yet');

        return false;
      }

      const isPaymentMarked = await this.markPaymentInVertalo(trade);

      if (!isPaymentMarked) {
        console.info(`[Trade ${investmentId}]`, 'Mark payment in Vertalo failed');

        return false;
      }

      await this.transferSharesInVertalo(trade);

      console.info(`[Trade ${investmentId}]`, 'Transfer shares when trade is settled success');

      return true;
    } catch (error) {
      console.error(`[Trade ${investmentId}]`, 'Transfer shares when trade is settled failed', error);

      return false;
    }
  }

  private async verifyTradeStatus(trade: Trade): Promise<boolean> {
    const tradeId = trade.getTradeId();

    if (!trade.isTradeSettled()) {
      const tradeStatus = await this.northCapitalAdapter.getTradeStatus(tradeId);

      if (!tradeStatus.isSettled()) {
        return false;
      }

      console.info(`[Trade ${trade.getInvestmentId()}]`, 'Transfer settled in North Capital');
      trade.setDisbursementStateAsCompleted();
      trade.setTradeStatusToSettled();
      await this.tradesRepository.updateTrade(trade);
    }

    return true;
  }

  private async markPaymentInVertalo(trade: Trade): Promise<boolean> {
    if (trade.isPaymentMarkedInVertalo()) {
      return true;
    }

    const { distributionId, amount } = trade.getVertaloDistributionPaymentDetails();
    const { paymentId } = await this.vertaloAdapter.markPayment(distributionId, amount);
    trade.setVertaloPaymentState(paymentId);
    await this.tradesRepository.updateTrade(trade);
    console.info(`[Trade ${trade.getInvestmentId()}]`, 'Payment marked in Vertalo');

    return true;
  }

  private async transferSharesInVertalo(trade: Trade): Promise<boolean> {
    if (trade.isSharesTransferredInVertalo()) {
      return true;
    }

    const { distributionId } = trade.getVertaloDistributionPaymentDetails();
    const { holdingId } = await this.vertaloAdapter.issueShares(distributionId);
    trade.setVertaloSharesTransferState(holdingId);
    await this.tradesRepository.updateTrade(trade);
    console.info(`[Trade ${trade.getInvestmentId()}]`, 'Shares transferred in Vertalo, holdingId:', holdingId);

    await this.sendSharesIssuedEvent(trade);

    return true;
  }

  private async sendSharesIssuedEvent(trade: Trade) {
    const { amount, fee, userTradeId, investmentId } = trade.getFundsTransferConfiguration();
    const { shares } = trade.getTradeSummary();
    await this.tradesRepository.publishEvent(
      storeEventCommand(trade.getProfileId(), 'SharesIssued', {
        accountId: trade.getReinvestAccountId(),
        investmentId,
        numberOfShares: shares.toString(),
        amount: amount.getAmount(),
        fee: fee.getAmount(),
        tradeId: userTradeId,
        date: DateTime.now().toIsoDateTime(),
      }),
    );
  }
}
