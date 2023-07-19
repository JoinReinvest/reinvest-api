import { ContainerInterface } from 'Container/Container';
import { PdfKinds } from 'HKEKTypes/Pdf';
import { WithdrawalDocumentPdfGeneratedEventHandler } from 'Reinvest/Withdrawals/src/Port/Queue/EventHandler/WithdrawalDocumentPdfGeneratedEventHandler';
import { EventBus, SimpleEventBus, STORE_EVENT_COMMAND } from 'SimpleAggregator/EventBus/EventBus';
import { GeneratePdfEventHandler } from 'SimpleAggregator/EventBus/GeneratePdfEventHandler';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';
import { WithdrawalsDocumentsEventHandler } from 'Withdrawals/Domain/DomainEventHanlder/WithdrawalsDocumentsEventHandler';
import { WithdrawalsDocumentsEvents } from 'Withdrawals/Domain/WithdrawalsDocuments';
import { Withdrawals } from 'Withdrawals/index';
import GenerateRedemptionForm from 'Withdrawals/UseCase/GenerateRedemptionForm';
import { MarkDocumentAsGenerated } from 'Withdrawals/UseCase/MarkDocumentAsGenerated';

export default class EventBusProvider {
  private config: Withdrawals.Config;

  constructor(config: Withdrawals.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container
      .addSingleton(WithdrawalsDocumentsEventHandler, [GenerateRedemptionForm])
      .addSingleton(WithdrawalDocumentPdfGeneratedEventHandler, [MarkDocumentAsGenerated]);

    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    eventBus
      .subscribeHandlerForKinds(SendToQueueEventHandler.getClassName(), [STORE_EVENT_COMMAND, 'GeneratePdfCommand'])
      .subscribeHandlerForKinds(WithdrawalsDocumentsEventHandler.getClassName(), [WithdrawalsDocumentsEvents.WithdrawalsDocumentCreated])
      .subscribe(PdfKinds.GeneratePdf, GeneratePdfEventHandler.getClassName());
  }
}
