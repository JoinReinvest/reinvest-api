import { ArchiveBeneficiary } from 'Archiving/UseCases/ArchiveBeneficiary';
import { DomainEvent } from 'SimpleAggregator/Types';

export class ArchiveBeneficiaryEventHandler {
  static getClassName = (): string => 'ArchiveBeneficiaryEventHandler';
  private archiveBeneficiaryUseCase: ArchiveBeneficiary;

  constructor(archiveBeneficiaryUseCase: ArchiveBeneficiary) {
    this.archiveBeneficiaryUseCase = archiveBeneficiaryUseCase;
  }

  async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'ArchiveBeneficiary') {
      return;
    }

    const { profileId, accountId } = event.data;

    await this.archiveBeneficiaryUseCase.execute(profileId, accountId);
  }
}
