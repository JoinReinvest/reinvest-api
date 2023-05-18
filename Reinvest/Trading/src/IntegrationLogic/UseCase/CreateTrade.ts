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
    const trade = await this.tradesRepository.getOrCreateTradeByInvestmentId(tradeConfiguration.investmentId, tradeConfiguration);

    const { accountId, portfolioId, bankAccountId } = tradeConfiguration;
    console.log('yep, I am in the create trade use case');
    const mappingIds = await this.registrationService.mapInternalIdsToVendorIds(portfolioId, bankAccountId, accountId);
  }
}
