import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { DocumentService } from 'Trading/Adapter/Module/DocumentService';
import { RegistrationService } from 'Trading/Adapter/Module/RegistrationService';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { TradingVertaloAdapter } from 'Trading/Adapter/Vertalo/TradingVertaloAdapter';
import { TradeConfiguration } from 'Trading/Domain/Trade';

export class CreateTrade {
  private tradesRepository: TradesRepository;
  private northCapitalAdapter: TradingNorthCapitalAdapter;
  private vertaloAdapter: TradingVertaloAdapter;
  private registrationService: RegistrationService;
  private documentService: DocumentService;

  constructor(
    tradesRepository: TradesRepository,
    northCapitalAdapter: TradingNorthCapitalAdapter,
    vertaloAdapter: TradingVertaloAdapter,
    registrationService: RegistrationService,
    documentService: DocumentService,
  ) {
    this.tradesRepository = tradesRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.vertaloAdapter = vertaloAdapter;
    this.registrationService = registrationService;
    this.documentService = documentService;
  }

  static getClassName = () => 'CreateTrade';

  async createTrade(tradeConfiguration: TradeConfiguration) {
    const trade = await this.tradesRepository.getOrCreateTradeByInvestmentId(tradeConfiguration);

    if (!trade.isVendorsConfigurationSet()) {
      const { accountId, portfolioId, bankAccountId } = trade.getInternalIds();
      const vendorsConfiguration = await this.registrationService.getVendorsConfiguration(portfolioId, bankAccountId, accountId);
      trade.setVendorsConfiguration(vendorsConfiguration);
      await this.tradesRepository.updateTrade(trade);
    }

    if (!trade.isTradeCreated()) {
      const { offeringId, shares, ip, northCapitalAccountId } = trade.getNorthCapitalTradeConfiguration();
      const northCapitalTrade = await this.northCapitalAdapter.createTrade(offeringId, northCapitalAccountId, shares, ip);
      trade.setTradeState(northCapitalTrade);
      await this.tradesRepository.updateTrade(trade);
    }

    if (!trade.isVertaloDistributionCreated()) {
      const { allocationId, investorEmail, numberOfShares } = trade.getVertaloDistributionConfiguration();
      const vertaloDistribution = await this.vertaloAdapter.createDistribution(allocationId, investorEmail, numberOfShares);
      trade.setVertaloDistributionState(vertaloDistribution);
      await this.tradesRepository.updateTrade(trade);
    }

    if (!trade.isFundsTransferCreated()) {
      const { accountId, offeringId, tradeId, bankName, amount, ip, investmentId } = trade.getFundsTransferConfiguration();
      const fundsTransfer = await this.northCapitalAdapter.createFundsTransfer(investmentId, accountId, offeringId, tradeId, bankName, amount, ip);
      trade.setFundsTransferState(fundsTransfer);
      await this.tradesRepository.updateTrade(trade);
    }
  }
}
