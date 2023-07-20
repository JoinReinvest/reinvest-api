import { TransactionEvent } from 'Investments/Domain/Transaction/TransactionEvents';
import { ChangeLockedCalculatedDividendStatus, SharesStatusChange } from 'SharesAndDividends/UseCase/ChangeLockedCalculatedDividendStatus';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class LockedCalculatedDividendEventHandler implements EventHandler<TransactionEvent> {
  static getClassName = (): string => 'LockedCalculatedDividendEventHandler';
  private changeLockedCalculatedDividendStatusUseCase: ChangeLockedCalculatedDividendStatus;

  constructor(changeLockedCalculatedDividendStatusUseCase: ChangeLockedCalculatedDividendStatus) {
    this.changeLockedCalculatedDividendStatusUseCase = changeLockedCalculatedDividendStatusUseCase;
  }

  async handle(event: DomainEvent): Promise<void> {
    if (!['SharesSettled', 'SharesRevoked'].includes(event.kind)) {
      return;
    }

    const sharesId = event.id;
    const sharesStatusChange = event.kind === 'SharesSettled' ? SharesStatusChange.SETTLED : SharesStatusChange.REVOKED;

    await this.changeLockedCalculatedDividendStatusUseCase.execute(sharesId, sharesStatusChange);
  }
}
