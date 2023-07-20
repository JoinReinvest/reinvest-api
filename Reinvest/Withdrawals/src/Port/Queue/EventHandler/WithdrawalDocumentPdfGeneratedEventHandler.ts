import { PdfEvents, PdfGenerated } from 'HKEKTypes/Pdf';
import { MarkDocumentAsGenerated } from 'Reinvest/Withdrawals/src/UseCase/MarkDocumentAsGenerated';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { MarkWithdrawalAgreementAsGenerated } from 'Withdrawals/UseCase/MarkWithdrawalAgreementAsGenerated';

export class WithdrawalDocumentPdfGeneratedEventHandler implements EventHandler<PdfGenerated> {
  static getClassName = (): string => 'WithdrawalDocumentPdfGeneratedEventHandler';
  private markDocumentAsGeneratedUseCase: MarkDocumentAsGenerated;
  private markWithdrawalAgreementAsGeneratedUseCase: MarkWithdrawalAgreementAsGenerated;

  constructor(markDocumentAsGeneratedUseCase: MarkDocumentAsGenerated, markWithdrawalAgreementAsGeneratedUseCase: MarkWithdrawalAgreementAsGenerated) {
    this.markDocumentAsGeneratedUseCase = markDocumentAsGeneratedUseCase;
    this.markWithdrawalAgreementAsGeneratedUseCase = markWithdrawalAgreementAsGeneratedUseCase;
  }

  public async handle(event: PdfGenerated): Promise<void> {
    if (event.kind !== PdfEvents.PdfGenerated) {
      return;
    }

    const { fileId } = event.data;

    await this.markDocumentAsGeneratedUseCase.execute(fileId);
    await this.markWithdrawalAgreementAsGeneratedUseCase.execute(fileId);
  }
}
