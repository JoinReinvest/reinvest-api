import { TransactionEvent } from 'Investments/Domain/Transaction/TransactionEvents';
import { FinancialOperationsRepository } from 'SharesAndDividends/Adapter/Database/Repository/FinancialOperationsRepository';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class NavUpdateEventHandler implements EventHandler<TransactionEvent> {
  private financialOperationRepository: FinancialOperationsRepository;

  constructor(financialOperationRepository: FinancialOperationsRepository) {
    this.financialOperationRepository = financialOperationRepository;
  }

  static getClassName = (): string => 'NavUpdateEventHandler';

  async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'NAV_UPDATED') {
      return;
    }

    const { portfolioId, unitPrice, numberOfShares } = event.data;
    const lastNavChanged = await this.financialOperationRepository.getLastNavChanged();

    if (lastNavChanged && lastNavChanged.unitPrice === unitPrice && lastNavChanged.numberOfShares === numberOfShares) {
      return;
    }

    await this.financialOperationRepository.navChangedOperation(numberOfShares, unitPrice, portfolioId);
  }
}
