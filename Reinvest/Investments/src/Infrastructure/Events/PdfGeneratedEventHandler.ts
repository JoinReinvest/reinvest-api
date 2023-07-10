import { PdfEvents, PdfGenerated } from 'HKEKTypes/Pdf';
import { MarkSubscriptionAgreementAsGenerated } from 'Investments/Application/UseCases/MarkSubscriptionAgreementAsGenerated';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';

export class PdfGeneratedEventHandler implements EventHandler<PdfGenerated> {
  static getClassName = (): string => 'PdfGeneratedEventHandler';
  private markAsGeneratedUseCase: MarkSubscriptionAgreementAsGenerated;

  constructor(markAsGeneratedUseCase: MarkSubscriptionAgreementAsGenerated) {
    this.markAsGeneratedUseCase = markAsGeneratedUseCase;
  }

  public async handle(event: PdfGenerated): Promise<void> {
    if (event.kind !== PdfEvents.PdfGenerated) {
      return;
    }

    const { profileId, fileId } = event.data;

    await this.markAsGeneratedUseCase.execute(profileId, fileId);
  }
}
