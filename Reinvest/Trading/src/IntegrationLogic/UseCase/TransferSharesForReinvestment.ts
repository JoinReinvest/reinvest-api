import { ReinvestmentRepository } from 'Trading/Adapter/Database/Repository/ReinvestmentRepository';
import { VendorsMappingService } from 'Trading/Adapter/Module/VendorsMappingService';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { TradingVertaloAdapter } from 'Trading/Adapter/Vertalo/TradingVertaloAdapter';
import { ReinvestmentTrade, ReinvestmentTradeConfiguration, ReinvestmentTradeSummary } from 'Trading/Domain/ReinvestmentTrade';

export class TransferSharesForReinvestment {
  private reinvestmentRepository: ReinvestmentRepository;
  private northCapitalAdapter: TradingNorthCapitalAdapter;
  private vertaloAdapter: TradingVertaloAdapter;
  private registrationService: VendorsMappingService;

  constructor(
    reinvestmentRepository: ReinvestmentRepository,
    northCapitalAdapter: TradingNorthCapitalAdapter,
    vertaloAdapter: TradingVertaloAdapter,
    registrationService: VendorsMappingService,
  ) {
    this.reinvestmentRepository = reinvestmentRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.vertaloAdapter = vertaloAdapter;
    this.registrationService = registrationService;
  }

  static getClassName = () => 'TransferSharesForReinvestment';

  async execute(tradeConfiguration: ReinvestmentTradeConfiguration): Promise<ReinvestmentTradeSummary | null> {
    const { dividendId } = tradeConfiguration;
    try {
      const trade = await this.reinvestmentRepository.getOrCreateTradeByDividendId(tradeConfiguration);
      console.info(`[Reinvestment ${dividendId}]`, 'Start reinvestment trade process', tradeConfiguration);

      // map reinvest ids to vendors ids
      if (!trade.isVendorsConfigurationSet()) {
        const { accountId, portfolioId } = trade.getInternalIds();
        const vendorsConfiguration = await this.registrationService.getReinvestmentVendorsConfiguration(portfolioId, accountId);
        trade.setVendorsConfiguration(vendorsConfiguration);
        await this.reinvestmentRepository.updateTrade(trade);
        console.info(`[Reinvestment Trade ${dividendId}]`, 'Vendors configuration set', vendorsConfiguration);
      }

      // create vertalo distribution
      if (!trade.isVertaloDistributionCreated()) {
        const { allocationId, investorEmail, numberOfShares } = trade.getVertaloDistributionConfiguration();
        const vertaloDistribution = await this.vertaloAdapter.createDistribution(allocationId, investorEmail, numberOfShares);
        trade.setVertaloDistributionState(vertaloDistribution);
        await this.reinvestmentRepository.updateTrade(trade);
        console.info(`[Reinvestment Trade ${dividendId}]`, 'Vertalo distribution created', vertaloDistribution);
      }

      if (trade.isVertaloDistributionDrafted()) {
        const { distributionId } = trade.getVertaloDistribution();
        const isClosed = await this.vertaloAdapter.closeDistribution(distributionId);

        if (isClosed) {
          trade.updateVertaloDistributionStatus('closed');
          await this.reinvestmentRepository.updateTrade(trade);
          console.info(`[Reinvestment Trade ${dividendId}]`, 'Vertalo distribution closed');
        } else {
          throw new Error('Vertalo distribution not closed');
        }
      }

      const isPaymentMarked = await this.markPaymentInVertalo(trade);

      if (!isPaymentMarked) {
        console.info(`[Reinvestment Trade ${dividendId}]`, 'Mark payment in Vertalo failed');

        return null;
      }

      await this.transferSharesInVertalo(trade);
      console.info(`[Reinvestment Trade ${dividendId}]`, 'Transfer shares when trade is settled success');

      return trade.getTradeSummary();
    } catch (error) {
      console.error(`[Reinvestment Trade ${dividendId}]`, 'Transfer shares when trade is settled failed', error);

      return null;
    }
  }

  private async markPaymentInVertalo(trade: ReinvestmentTrade): Promise<boolean> {
    if (trade.isPaymentMarkedInVertalo()) {
      return true;
    }

    const { distributionId, amount } = trade.getVertaloDistributionPaymentDetails();
    const { paymentId } = await this.vertaloAdapter.markPayment(distributionId, amount);
    trade.setVertaloPaymentState(paymentId);
    await this.reinvestmentRepository.updateTrade(trade);
    console.info(`[Reinvestment Trade ${trade.getDividendId()}]`, 'Payment marked in Vertalo');

    return true;
  }

  private async transferSharesInVertalo(trade: ReinvestmentTrade): Promise<boolean> {
    if (trade.isSharesTransferredInVertalo()) {
      return true;
    }

    const { distributionId } = trade.getVertaloDistributionPaymentDetails();
    const { holdingId } = await this.vertaloAdapter.issueShares(distributionId);
    trade.setVertaloSharesTransferState(holdingId);
    await this.reinvestmentRepository.updateTrade(trade);
    console.info(`[Reinvestment Trade ${trade.getDividendId()}]`, 'Shares transferred in Vertalo, holdingId:', holdingId);

    return true;
  }
}
