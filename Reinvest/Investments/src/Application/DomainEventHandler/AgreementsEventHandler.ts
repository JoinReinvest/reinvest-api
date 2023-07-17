import { GenerateSubscriptionAgreement } from 'Investments/Application/UseCases/GenerateSubscriptionAgreement';
import { SubscriptionAgreementEvent, SubscriptionAgreementEvents } from 'Investments/Domain/Investments/SubscriptionAgreement';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';

export class AgreementsEventHandler implements EventHandler<SubscriptionAgreementEvent> {
  static getClassName = (): string => 'AgreementsEventHandler';

  private generateSubscriptionAgreementUseCase: GenerateSubscriptionAgreement;

  constructor(generateSubscriptionAgreementUseCase: GenerateSubscriptionAgreement) {
    this.generateSubscriptionAgreementUseCase = generateSubscriptionAgreementUseCase;
  }

  async handle(event: SubscriptionAgreementEvent): Promise<void> {
    if (!Object.values(SubscriptionAgreementEvents).includes(event.kind)) {
      return;
    }

    await this.generateSubscriptionAgreementUseCase.execute(event.data.profileId, event.id);
  }
}
