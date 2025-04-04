import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import CreatePayoutDocument from 'Withdrawals/UseCase/CreatePayoutDocument';
import CreateRedemptionFormDocument from 'Withdrawals/UseCase/CreateRedemptionFormDocument';

import { WithdrawalsEvent, WithdrawalsEvents } from '../Withdrawal';

export class CreateDocumentsEventHandler implements EventHandler<WithdrawalsEvent> {
  static getClassName = (): string => 'CreateDocumentsEventHandler';

  private createRedemptionFormDocument: CreateRedemptionFormDocument;
  private createPayoutDocument: CreatePayoutDocument;

  constructor(createRedemptionFormDocument: CreateRedemptionFormDocument, createPayoutDocument: CreatePayoutDocument) {
    this.createRedemptionFormDocument = createRedemptionFormDocument;
    this.createPayoutDocument = createPayoutDocument;
  }

  async handle(event: WithdrawalsEvent): Promise<void> {
    if (!Object.values(WithdrawalsEvents).includes(event.kind)) {
      return;
    }

    const withdrawalId = event.data.withdrawalId;

    await this.createRedemptionFormDocument.execute(withdrawalId);
    await this.createPayoutDocument.execute(withdrawalId);
  }
}
