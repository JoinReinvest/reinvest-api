import { PdfEvents, PdfGenerated } from 'HKEKTypes/Pdf';
import { MarkDocumentAsGenerated } from 'Reinvest/Withdrawals/src/UseCase/MarkDocumentAsGenerated';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';

export class WithdrawalDocumentPdfGeneratedEventHandler implements EventHandler<PdfGenerated> {
  static getClassName = (): string => 'WithdrawalDocumentPdfGeneratedEventHandler';
  private markDocumentAsGeneratedUseCase: MarkDocumentAsGenerated;

  constructor(markDocumentAsGeneratedUseCase: MarkDocumentAsGenerated) {
    this.markDocumentAsGeneratedUseCase = markDocumentAsGeneratedUseCase;
  }

  public async handle(event: PdfGenerated): Promise<void> {
    if (event.kind !== PdfEvents.PdfGenerated) {
      return;
    }

    const { fileId } = event.data;

    await this.markDocumentAsGeneratedUseCase.execute(fileId);
  }
}
