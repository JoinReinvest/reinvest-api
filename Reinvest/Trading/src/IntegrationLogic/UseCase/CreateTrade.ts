import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { TradingDocumentService } from 'Trading/Adapter/Module/TradingDocumentService';
import { VendorsMappingService } from 'Trading/Adapter/Module/VendorsMappingService';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { TradingVertaloAdapter } from 'Trading/Adapter/Vertalo/TradingVertaloAdapter';
import { TradeConfiguration, TradeSummary } from 'Trading/Domain/Trade';

export class CreateTrade {
  private tradesRepository: TradesRepository;
  private northCapitalAdapter: TradingNorthCapitalAdapter;
  private vertaloAdapter: TradingVertaloAdapter;
  private registrationService: VendorsMappingService;
  private documentService: TradingDocumentService;

  constructor(
    tradesRepository: TradesRepository,
    northCapitalAdapter: TradingNorthCapitalAdapter,
    vertaloAdapter: TradingVertaloAdapter,
    registrationService: VendorsMappingService,
    documentService: TradingDocumentService,
  ) {
    this.tradesRepository = tradesRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.vertaloAdapter = vertaloAdapter;
    this.registrationService = registrationService;
    this.documentService = documentService;
  }

  static getClassName = () => 'CreateTrade';

  async createTrade(tradeConfiguration: TradeConfiguration): Promise<TradeSummary | null> {
    try {
      const trade = await this.tradesRepository.getOrCreateTradeByInvestmentId(tradeConfiguration);
      console.info(`[Trade ${tradeConfiguration.investmentId}]`, 'Start trade process', tradeConfiguration);

      // map reinvest ids to vendors ids
      if (!trade.isVendorsConfigurationSet()) {
        const { accountId, portfolioId, bankAccountId } = trade.getInternalIds();
        const vendorsConfiguration = await this.registrationService.getVendorsConfiguration(portfolioId, bankAccountId, accountId);
        trade.setVendorsConfiguration(vendorsConfiguration);
        await this.tradesRepository.updateTrade(trade);
        console.info(`[Trade ${tradeConfiguration.investmentId}]`, 'Vendors configuration set', vendorsConfiguration);
      }

      // create trade in north capital
      if (!trade.isTradeCreated()) {
        const { offeringId, shares, ip, northCapitalAccountId } = trade.getNorthCapitalTradeConfiguration();
        const northCapitalTrade = await this.northCapitalAdapter.createTrade(offeringId, northCapitalAccountId, shares, ip);
        trade.setTradeState(northCapitalTrade);
        await this.tradesRepository.updateTrade(trade);
        console.info(`[Trade ${tradeConfiguration.investmentId}]`, 'NC Trade created', northCapitalTrade);
      }

      // create vertalo distribution
      if (!trade.isVertaloDistributionCreated()) {
        const { allocationId, investorEmail, numberOfShares } = trade.getVertaloDistributionConfiguration();
        const vertaloDistribution = await this.vertaloAdapter.createDistribution(allocationId, investorEmail, numberOfShares);
        trade.setVertaloDistributionState(vertaloDistribution);
        await this.tradesRepository.updateTrade(trade);
        console.info(`[Trade ${tradeConfiguration.investmentId}]`, 'Vertalo distribution created', vertaloDistribution);
      }

      // TODO uncomment it when subscription agreement will be ready
      // upload subscription agreement to north capital trade
      /** if (!trade.isSubscriptionAgreementUploaded()) {
        const { tradeId, subscriptionAgreementId, profileId } = trade.getSubscriptionAgreementConfiguration();
        const { url } = await this.documentService.getDocumentFileLink(subscriptionAgreementId, profileId);
        const subscriptionAgreementState = await this.northCapitalAdapter.uploadSubscriptionAgreementToTrade(tradeId, url, subscriptionAgreementId);
        trade.setSubscriptionAgreementState({ subscriptionAgreementId, status: subscriptionAgreementState });
        await this.tradesRepository.updateTrade(trade);
        console.info(`[Trade ${tradeConfiguration.investmentId}]`, 'Subscription agreement uploaded', subscriptionAgreementId);
      }**/

      // init funds transfer
      if (!trade.isFundsTransferCreated()) {
        const { accountId, offeringId, tradeId, bankName, amount, ip, investmentId } = trade.getFundsTransferConfiguration();
        const fundsTransfer = await this.northCapitalAdapter.createFundsTransfer(investmentId, accountId, offeringId, tradeId, bankName, amount, ip);
        trade.setFundsTransferState(fundsTransfer);
        await this.tradesRepository.updateTrade(trade);
        console.info(`[Trade ${tradeConfiguration.investmentId}]`, 'NC funds transfer created', fundsTransfer);
      }

      // open distribution (awaiting for funds transfer)
      if (trade.isVertaloDistributionDrafted()) {
        const { distributionId } = trade.getVertaloDistribution();
        const isOpened = await this.vertaloAdapter.openDistribution(distributionId);

        if (isOpened) {
          trade.updateVertaloDistributionStatus('open');
          await this.tradesRepository.updateTrade(trade);
          console.info(`[Trade ${tradeConfiguration.investmentId}]`, 'Vertalo distribution opened');
        } else {
          throw new Error('Vertalo distribution not opened');
        }
      }

      return trade.getTradeSummary();
    } catch (error) {
      console.error(`[Trade ${tradeConfiguration.investmentId}]`, 'Trade failed', tradeConfiguration, error);

      return null;
    }
  }
}
