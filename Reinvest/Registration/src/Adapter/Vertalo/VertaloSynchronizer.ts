import { VertaloSynchronizationRepository } from 'Registration/Adapter/Database/Repository/VertaloSynchronizationRepository';
import { VertaloAdapter } from 'Registration/Adapter/Vertalo/VertaloAdapter';
import { VertaloIndividualAccount } from 'Registration/Domain/VendorModel/Vertalo/VertaloIndividualAccount';
import { VertaloEntityType } from 'Registration/Domain/VendorModel/Vertalo/VertaloTypes';

export class VertaloSynchronizer {
  static getClassName = () => 'VertaloSynchronizer';
  private vertaloAdapter: VertaloAdapter;
  private vertaloSynchronizationRepository: VertaloSynchronizationRepository;

  constructor(vertaloAdapter: VertaloAdapter, vertaloSynchronizationRepository: VertaloSynchronizationRepository) {
    this.vertaloAdapter = vertaloAdapter;
    this.vertaloSynchronizationRepository = vertaloSynchronizationRepository;
  }

  async synchronizeIndividualAccount(recordId: string, vertaloIndividualAccount: VertaloIndividualAccount): Promise<void> {
    const vertaloSynchronizationRecord = await this.vertaloSynchronizationRepository.getSynchronizationRecord(recordId);

    if (vertaloSynchronizationRecord === null) {
      const { name, email } = vertaloIndividualAccount.getData();
      const investorIds = await this.vertaloAdapter.createInvestor(name, email);
      await this.vertaloSynchronizationRepository.createSynchronizationRecord(
        recordId,
        investorIds,
        vertaloIndividualAccount.getCrc(),
        VertaloEntityType.ACCOUNT,
      );
    } else if (vertaloSynchronizationRecord.isOutdated(vertaloIndividualAccount.getCrc())) {
      const { name } = vertaloIndividualAccount.getData();
      await this.vertaloAdapter.updateInvestor(vertaloSynchronizationRecord.getInvestorIds(), name);
      vertaloSynchronizationRecord.setCrc(vertaloIndividualAccount.getCrc());
      await this.vertaloSynchronizationRepository.updateSynchronizationRecord(vertaloSynchronizationRecord);
    }
  }
}
