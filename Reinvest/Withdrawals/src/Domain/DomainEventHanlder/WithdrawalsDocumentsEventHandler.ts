import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import GenerateWithdrawalDocument from 'Withdrawals/UseCase/GenerateWithdrawalDocument';

import { WithdrawalsDocumentsEvent, WithdrawalsDocumentsEvents } from '../WithdrawalsDocuments';

export class WithdrawalsDocumentsEventHandler implements EventHandler<WithdrawalsDocumentsEvent> {
  static getClassName = (): string => 'WithdrawalsDocumentsEventHandler';

  private generateWithdrawalDocument: GenerateWithdrawalDocument;

  constructor(generateWithdrawalDocument: GenerateWithdrawalDocument) {
    this.generateWithdrawalDocument = generateWithdrawalDocument;
  }

  async handle(event: WithdrawalsDocumentsEvent): Promise<void> {
    if (!Object.values(WithdrawalsDocumentsEvents).includes(event.kind)) {
      return;
    }

    await this.generateWithdrawalDocument.execute(event.data.type, event.id);
  }
}
