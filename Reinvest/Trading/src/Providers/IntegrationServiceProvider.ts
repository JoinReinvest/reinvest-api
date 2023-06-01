import { ContainerInterface } from 'Container/Container';
import { ReinvestmentRepository } from 'Trading/Adapter/Database/Repository/ReinvestmentRepository';
import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { TradingDocumentService } from 'Trading/Adapter/Module/TradingDocumentService';
import { VendorsMappingService } from 'Trading/Adapter/Module/VendorsMappingService';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { TradingVertaloAdapter } from 'Trading/Adapter/Vertalo/TradingVertaloAdapter';
import { Trading } from 'Trading/index';
import { CheckIsTradeApproved } from 'Trading/IntegrationLogic/UseCase/CheckIsTradeApproved';
import { CheckIsTradeFunded } from 'Trading/IntegrationLogic/UseCase/CheckIsTradeFunded';
import { CreateTrade } from 'Trading/IntegrationLogic/UseCase/CreateTrade';
import { MarkFundsAsReadyToDisburse } from 'Trading/IntegrationLogic/UseCase/MarkFundsAsReadyToDisburse';
import { TransferSharesForReinvestment } from 'Trading/IntegrationLogic/UseCase/TransferSharesForReinvestment';
import { TransferSharesWhenTradeSettled } from 'Trading/IntegrationLogic/UseCase/TransferSharesWhenTradeSettled';

export class IntegrationServiceProvider {
  private config: Trading.Config;

  constructor(config: Trading.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(CreateTrade, [TradesRepository, TradingNorthCapitalAdapter, TradingVertaloAdapter, VendorsMappingService, TradingDocumentService]);
    container.addSingleton(CheckIsTradeFunded, [TradesRepository, TradingNorthCapitalAdapter, TradingVertaloAdapter]);
    container.addSingleton(CheckIsTradeApproved, [TradesRepository, TradingNorthCapitalAdapter]);
    container.addSingleton(MarkFundsAsReadyToDisburse, [TradesRepository, TradingNorthCapitalAdapter]);
    container.addSingleton(TransferSharesWhenTradeSettled, [TradesRepository, TradingNorthCapitalAdapter, TradingVertaloAdapter]);
    container.addSingleton(TransferSharesForReinvestment, [ReinvestmentRepository, TradingNorthCapitalAdapter, TradingVertaloAdapter, VendorsMappingService]);
  }
}
