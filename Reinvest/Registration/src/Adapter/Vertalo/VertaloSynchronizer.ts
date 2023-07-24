import { VertaloSynchronizationRepository } from 'Registration/Adapter/Database/Repository/VertaloSynchronizationRepository';
import { VertaloAdapter } from 'Registration/Adapter/Vertalo/VertaloAdapter';
import { VertaloAccount } from 'Registration/Domain/VendorModel/Vertalo/VertaloAccount';
import { VertaloEntityType } from 'Registration/Domain/VendorModel/Vertalo/VertaloTypes';

export class VertaloSynchronizer {
  static getClassName = () => 'VertaloSynchronizer';
  private vertaloAdapter: VertaloAdapter;
  private vertaloSynchronizationRepository: VertaloSynchronizationRepository;

  constructor(vertaloAdapter: VertaloAdapter, vertaloSynchronizationRepository: VertaloSynchronizationRepository) {
    this.vertaloAdapter = vertaloAdapter;
    this.vertaloSynchronizationRepository = vertaloSynchronizationRepository;
  }

  async synchronizeAccount(recordId: string, vertaloAccount: VertaloAccount): Promise<void> {
    const vertaloSynchronizationRecord = await this.vertaloSynchronizationRepository.getSynchronizationRecord(recordId);

    if (vertaloSynchronizationRecord === null) {
      const { name, email } = vertaloAccount.getData();
      const investorIds = await this.vertaloAdapter.createInvestor(name, email);
      await this.vertaloSynchronizationRepository.createSynchronizationRecord(recordId, investorIds, vertaloAccount.getCrc(), VertaloEntityType.ACCOUNT);
    } else if (vertaloSynchronizationRecord.isOutdated(vertaloAccount.getCrc())) {
      const { name } = vertaloAccount.getData();
      await this.vertaloAdapter.updateInvestor(vertaloSynchronizationRecord.getInvestorIds(), name);
      vertaloSynchronizationRecord.setCrc(vertaloAccount.getCrc());
      await this.vertaloSynchronizationRepository.updateSynchronizationRecord(vertaloSynchronizationRecord);
    }
  }
}
