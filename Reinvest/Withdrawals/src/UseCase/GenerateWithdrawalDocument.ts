import { UUID } from 'HKEKTypes/Generics';
import { GeneratePdfCommand, PdfKinds } from 'HKEKTypes/Pdf';
import { WithdrawalsDocumentsRepository } from 'Reinvest/Withdrawals/src/Adapter/Database/Repository/WithdrawalsDocumentsRepository';
import { DomainEvent } from 'SimpleAggregator/Types';
import { WithdrawalsDocumentsTypes } from 'Withdrawals/Domain/WithdrawalsDocuments';

const ADMIN_CATALOG_NAME = 'admin';

class GenerateWithdrawalDocument {
  private readonly withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository;

  constructor(withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository) {
    this.withdrawalsDocumentsRepository = withdrawalsDocumentsRepository;
  }

  static getClassName = (): string => 'GenerateWithdrawalDocument';

  async execute(type: WithdrawalsDocumentsTypes, id: UUID): Promise<void> {
    const withdrawalsDocument = await this.withdrawalsDocumentsRepository.getById(id);
    const events: DomainEvent[] = [];

    if (!withdrawalsDocument) {
      console.error(`Can not generate not existing withdrawal document `);

      return;
    }

    const { template, content, version } = withdrawalsDocument.forParser();

    const pdfCommand: GeneratePdfCommand = {
      id,
      kind: PdfKinds.GeneratePdf,
      data: {
        catalog: ADMIN_CATALOG_NAME,
        fileName: id,
        template,
        version,
        content,
        fileId: id,
        profileId: id, // profile id must be valid uuid, event that we don't have it for this use case
      },
    };
    events.push(pdfCommand);
    await this.withdrawalsDocumentsRepository.publishEvents(events);
  }
}

export default GenerateWithdrawalDocument;
