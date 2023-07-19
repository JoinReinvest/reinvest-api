import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import GenerateRedemptionForm from 'Withdrawals/UseCase/GenerateRedemptionForm';

import { WithdrawalsDocumentsEvent, WithdrawalsDocumentsEvents } from '../WithdrawalsDocuments';

export class WithdrawalsDocumentsEventHandler implements EventHandler<WithdrawalsDocumentsEvent> {
  static getClassName = (): string => 'WithdrawalsDocumentsEventHandler';

  private generateRedemptionForm: GenerateRedemptionForm;

  constructor(generateRedemptionForm: GenerateRedemptionForm) {
    this.generateRedemptionForm = generateRedemptionForm;
  }

  async handle(event: WithdrawalsDocumentsEvent): Promise<void> {
    if (!Object.values(WithdrawalsDocumentsEvents).includes(event.kind)) {
      return;
    }

    await this.generateRedemptionForm.execute(event.data.type, event.id);
  }
}
