import { EventBus, storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { TradingDocumentService } from 'Trading/Adapter/Module/TradingDocumentService';
import { VendorsMappingService } from 'Trading/Adapter/Module/VendorsMappingService';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { TradingVertaloAdapter } from 'Trading/Adapter/Vertalo/TradingVertaloAdapter';
import { Trade, TradeConfiguration, TradeSummary } from 'Trading/Domain/Trade';

export enum CreateTradeState {
  CREATED = 'CREATED',
  PAYMENT_MISMATCHED = 'PAYMENT_MISMATCHED',
  PROCESSING = 'PROCESSING',
}

export type CreateTradeEvent = {
  state: CreateTradeState;
  summary?: TradeSummary;
};

export class CreateTrade {
  private tradesRepository: TradesRepository;
  private northCapitalAdapter: TradingNorthCapitalAdapter;
  private vertaloAdapter: TradingVertaloAdapter;
  private registrationService: VendorsMappingService;
  private documentService: TradingDocumentService;
  private eventBus: EventBus;

  constructor(
    tradesRepository: TradesRepository,
    northCapitalAdapter: TradingNorthCapitalAdapter,
    vertaloAdapter: TradingVertaloAdapter,
    registrationService: VendorsMappingService,
    documentService: TradingDocumentService,
    eventBus: EventBus,
  ) {
    this.tradesRepository = tradesRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.vertaloAdapter = vertaloAdapter;
    this.registrationService = registrationService;
    this.documentService = documentService;
    this.eventBus = eventBus;
  }

  static getClassName = () => 'CreateTrade';

  async createTrade(tradeConfiguration: TradeConfiguration): Promise<CreateTradeEvent> {
    try {
      const trade = await this.tradesRepository.getOrCreateTradeByInvestmentId(tradeConfiguration);
      console.info(`[Trade ${tradeConfiguration.investmentId}]`, 'Start trade process', tradeConfiguration);

      // map reinvest ids to vendors ids
      if (!trade.isVendorsConfigurationSet()) {
        const { accountId, portfolioId, bankAccountId, parentId } = trade.getInternalIds();
        const vendorsConfiguration = await this.registrationService.getVendorsConfiguration(portfolioId, bankAccountId, accountId, parentId);
        trade.setVendorsConfiguration(vendorsConfiguration);
        await this.tradesRepository.updateTrade(trade);
        console.info(`[Trade ${tradeConfiguration.investmentId}]`, 'Vendors configuration set', vendorsConfiguration);
      }

      // create trade in north capital
      if (!trade.tradeExists()) {
        await this.createTradeInNorthCapital(trade);
        await this.tradesRepository.updateTrade(trade);
      }

      //  Automatic recreating trade with the latest NAV - available only if we don't have share price in the Subscription Agreement
      //  if (trade.isPaymentMismatched()) {
      //   console.error(`Payment mismatch for investment ${tradeConfiguration.investmentId}, share price: ${trade.getUnitPrice()}`);
      //
      //   // get the latest NAV
      //   const { portfolioId } = trade.getInternalIds();
      //   const latestNav = await this.registrationService.getAbsoluteCurrentNav(portfolioId);
      //   trade.updateUnitSharePrice(latestNav);
      //
      //   // remove trade from north capital
      //   const { ncAccountId, tradeId } = trade.getTradeToDelete();
      //   const removeDetails = await this.northCapitalAdapter.removeTrade(ncAccountId, tradeId);
      //
      //   // create new trade in north capital with the latest NAV
      //   await this.createTradeInNorthCapital(trade);
      //   trade.setRemoveTradeDetails(removeDetails, tradeId);
      //   await this.tradesRepository.updateTrade(trade);
      //
      //   console.error(`Recreate trade ${tradeConfiguration.investmentId} with new share price ${trade.getUnitPrice()} after payment mismatch`);
      // }

      // if payment mismatch, then revert the trade
      if (trade.isPaymentMismatched()) {
        console.error(`There is payment mismatch for trade ${tradeConfiguration.investmentId}. Trade will be reverted`);
        const { portfolioId } = trade.getInternalIds();
        await this.registrationService.getAbsoluteCurrentNav(portfolioId); // push sync to get the latest NAV for future trades

        return {
          state: CreateTradeState.PAYMENT_MISMATCHED,
        };
      }

      // create vertalo distribution
      if (!trade.isVertaloDistributionCreated()) {
        const { allocationId, investorEmail, numberOfShares } = trade.getVertaloDistributionConfiguration();
        const vertaloDistribution = await this.vertaloAdapter.createDistribution(allocationId, investorEmail, numberOfShares);
        trade.setVertaloDistributionState(vertaloDistribution);
        await this.tradesRepository.updateTrade(trade);
        console.info(`[Trade ${tradeConfiguration.investmentId}]`, 'Vertalo distribution created', vertaloDistribution);
      }

      // upload subscription agreement to north capital trade
      if (!trade.isSubscriptionAgreementUploaded()) {
        const { tradeId, subscriptionAgreementId, profileId } = trade.getSubscriptionAgreementConfiguration();
        const { url } = await this.documentService.getDocumentFileLink(subscriptionAgreementId, profileId);
        const subscriptionAgreementState = await this.northCapitalAdapter.uploadSubscriptionAgreementToTrade(tradeId, url, subscriptionAgreementId);
        trade.setSubscriptionAgreementState({ subscriptionAgreementId, status: subscriptionAgreementState });
        await this.tradesRepository.updateTrade(trade);
        console.info(`[Trade ${tradeConfiguration.investmentId}]`, 'Subscription agreement uploaded', subscriptionAgreementId);
      }

      // init funds transfer
      if (!trade.isFundsTransferCreated()) {
        const { ncAccountId, offeringId, tradeId, bankName, amount, fee, ip, investmentId, userTradeId } = trade.getFundsTransferConfiguration();
        const fundsTransfer = await this.northCapitalAdapter.createFundsTransfer(investmentId, ncAccountId, offeringId, tradeId, bankName, amount, ip);
        trade.setFundsTransferState(fundsTransfer);
        await this.tradesRepository.updateTrade(trade);
        console.info(`[Trade ${tradeConfiguration.investmentId}]`, 'NC funds transfer created', fundsTransfer);

        await this.eventBus.publish(
          storeEventCommand(trade.getProfileId(), 'PaymentInitiated', {
            accountId: trade.getReinvestAccountId(),
            investmentId,
            amount: amount.getAmount(),
            fee: fee.getAmount(),
            tradeId: userTradeId,
          }),
        );
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

      return {
        state: CreateTradeState.CREATED,
        summary: trade.getTradeSummary(),
      };
    } catch (error) {
      console.error(`[Trade ${tradeConfiguration.investmentId}]`, 'Trade failed', tradeConfiguration, error);

      return {
        state: CreateTradeState.PROCESSING,
      };
    }
  }

  private async createTradeInNorthCapital(trade: Trade): Promise<void> {
    const { offeringId, shares, ip, northCapitalAccountId } = trade.getNorthCapitalTradeConfiguration();
    const northCapitalTrade = await this.northCapitalAdapter.createTrade(offeringId, northCapitalAccountId, shares, ip);
    trade.setTradeState(northCapitalTrade);

    console.info(`[Trade ${trade.getInvestmentId()}]`, 'NC Trade created', northCapitalTrade);
  }
}
