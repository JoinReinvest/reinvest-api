import { ContainerInterface } from 'Container/Container';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';
import { Verification } from 'Verification/index';
import { VerifyAccount } from 'Verification/IntegrationLogic/UseCase/VerifyAccount';
import { VerifyAccountForInvestmentHandler } from 'Verification/Port/Queue/EventHandler/VerifyAccountForInvestmentHandler';
import { NotifyAccountNotVerifiedEventHandler } from 'Verification/IntegrationLogic/Events/NotifyAccountNotVerifiedEventHandler';
import { MarkSensitiveDataUpdatedHandler } from 'Verification/Port/Queue/EventHandler/MarkSensitiveDataUpdatedHandler';
import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';

export default class EventBusProvider {
  private config: Verification.Config;

  constructor(config: Verification.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(VerifyAccountForInvestmentHandler, [VerifyAccount, SimpleEventBus]);
    container.addSingleton(NotifyAccountNotVerifiedEventHandler, [SimpleEventBus]);
    container.addSingleton(MarkSensitiveDataUpdatedHandler, [VerifierRepository]);

    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    eventBus.subscribeHandlerForKinds(NotifyAccountNotVerifiedEventHandler.getClassName(), ['AccountNotVerifiedForInvestment', 'AccountVerifiedForInvestment']);
    eventBus.subscribeHandlerForKinds(SendToQueueEventHandler.getClassName(), ['AccountVerifiedForInvestment', 'CreateNotification', 'DismissNotification']);
  }
}
