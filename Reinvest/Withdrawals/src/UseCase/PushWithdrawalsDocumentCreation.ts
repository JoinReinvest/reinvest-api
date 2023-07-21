import { UUID } from 'HKEKTypes/Generics';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { WithdrawalsEvents } from 'Withdrawals/Domain/Withdrawal';

export class PushWithdrawalsDocumentCreation {
  static getClassName = (): string => 'PushWithdrawalsDocumentCreation';
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  async execute(withdrawalId: UUID) {
    await this.eventBus.publish({
      id: withdrawalId,
      kind: WithdrawalsEvents.PushWithdrawalsDocumentCreation,
      data: {
        withdrawalId,
      },
    });
  }
}
