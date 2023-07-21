import { UUID } from 'HKEKTypes/Generics';
import { WithdrawalsDocumentsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsDocumentsRepository';
import { WithdrawalsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsRepository';

export class MarkDocumentAsGenerated {
  static getClassName = (): string => 'MarkDocumentAsGenerated';

  private readonly withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository;
  private withdrawalsRepository: WithdrawalsRepository;

  constructor(withdrawalsDocumentsRepository: WithdrawalsDocumentsRepository, withdrawalsRepository: WithdrawalsRepository) {
    this.withdrawalsDocumentsRepository = withdrawalsDocumentsRepository;
    this.withdrawalsRepository = withdrawalsRepository;
  }

  async execute(id: UUID): Promise<void> {
    const document = await this.withdrawalsDocumentsRepository.getById(id);

    if (!document) {
      return;
    }

    document.markAsGenerated();
    await this.withdrawalsDocumentsRepository.store(document);

    const generatedDocuments = await this.withdrawalsDocumentsRepository.getGeneratedDocuments(document.getWithdrawalId());

    if (generatedDocuments.length === 0) {
      return;
    }

    const withdrawal = await this.withdrawalsRepository.getById(document.getWithdrawalId());

    if (!withdrawal) {
      console.error(`Withdrawal with id ${document.getWithdrawalId()} not found`);

      return;
    }

    if (withdrawal.markAsReadyToSend(generatedDocuments)) {
      await this.withdrawalsRepository.store(withdrawal);
    }
  }
}
