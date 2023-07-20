import { ContainerInterface } from 'Container/Container';
import { PdfKinds } from 'HKEKTypes/Pdf';
import { WithdrawalDocumentPdfGeneratedEventHandler } from 'Reinvest/Withdrawals/src/Port/Queue/EventHandler/WithdrawalDocumentPdfGeneratedEventHandler';
import { EventBus, SimpleEventBus, STORE_EVENT_COMMAND } from 'SimpleAggregator/EventBus/EventBus';
import { GeneratePdfEventHandler } from 'SimpleAggregator/EventBus/GeneratePdfEventHandler';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';
import { CreateDocumentsEventHandler } from 'Withdrawals/Domain/DomainEventHanlder/CreateDocumentsEventHandler';
import { WithdrawalsDocumentsEventHandler } from 'Withdrawals/Domain/DomainEventHanlder/WithdrawalsDocumentsEventHandler';
import { WithdrawalsEvents } from 'Withdrawals/Domain/Withdrawal';
import { WithdrawalsDocumentsEvents } from 'Withdrawals/Domain/WithdrawalsDocuments';
import { Withdrawals } from 'Withdrawals/index';
import CreatePayoutDocument from 'Withdrawals/UseCase/CreatePayoutDocument';
import CreateRedemptionFormDocument from 'Withdrawals/UseCase/CreateRedemptionFormDocument';
import GenerateWithdrawalDocument from 'Withdrawals/UseCase/GenerateWithdrawalDocument';
import { MarkDocumentAsGenerated } from 'Withdrawals/UseCase/MarkDocumentAsGenerated';
import { MarkWithdrawalAgreementAsGenerated } from 'Withdrawals/UseCase/MarkWithdrawalAgreementAsGenerated';

export default class EventBusProvider {
  private config: Withdrawals.Config;

  constructor(config: Withdrawals.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container
      .addSingleton(CreateDocumentsEventHandler, [CreateRedemptionFormDocument, CreatePayoutDocument])
      .addSingleton(WithdrawalsDocumentsEventHandler, [GenerateWithdrawalDocument])
      .addSingleton(WithdrawalDocumentPdfGeneratedEventHandler, [MarkDocumentAsGenerated, MarkWithdrawalAgreementAsGenerated]);

    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    eventBus
      .subscribeHandlerForKinds(SendToQueueEventHandler.getClassName(), [STORE_EVENT_COMMAND, 'GeneratePdfCommand'])
      .subscribeHandlerForKinds(CreateDocumentsEventHandler.getClassName(), [
        WithdrawalsEvents.WithdrawalCreated,
        WithdrawalsEvents.PushWithdrawalsDocumentCreation,
      ])
      .subscribeHandlerForKinds(WithdrawalsDocumentsEventHandler.getClassName(), [WithdrawalsDocumentsEvents.WithdrawalsDocumentCreated])
      .subscribe(PdfKinds.GeneratePdf, GeneratePdfEventHandler.getClassName());
  }
}
