import { UUID } from 'HKEKTypes/Generics';
import { WithdrawalsDocumentsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsDocumentsRepository';

export class MarkDocumentAsGenerated {
  static getClassName = (): string => 'MarkDocumentAsGenerated';

  private readonly withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository;

  constructor(withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository) {
    this.withdrawalsDocumentsRepository = withdrawalsDocumentsRepository;
  }

  async execute(id: UUID): Promise<void> {
    const document = await this.withdrawalsDocumentsRepository.getById(id);

    if (!document) {
      return;
    }

    document.markAsGenerated();
    await this.withdrawalsDocumentsRepository.update(document);
  }
}
