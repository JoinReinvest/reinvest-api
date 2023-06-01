import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { MappedType } from 'Registration/Domain/Model/Mapping/MappedType';
import { SynchronizeBeneficiaryAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeBeneficiaryAccount';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class BeneficiaryAccountOpenedEventHandler implements EventHandler<DomainEvent> {
  private mappingRegistryRepository: MappingRegistryRepository;
  private synchronizeBeneficiaryAccount: SynchronizeBeneficiaryAccount;

  constructor(mappingRegistryRepository: MappingRegistryRepository, synchronizeBeneficiaryAccount: SynchronizeBeneficiaryAccount) {
    this.mappingRegistryRepository = mappingRegistryRepository;
    this.synchronizeBeneficiaryAccount = synchronizeBeneficiaryAccount;
  }

  static getClassName = (): string => 'BeneficiaryAccountOpenedEventHandler';

  public async handle(event: DomainEvent): Promise<void> {
    const {
      id: profileId,
      data: { beneficiaryAccountId },
    } = event;
    const record = await this.mappingRegistryRepository.addRecord(MappedType.BENEFICIARY_ACCOUNT, profileId, beneficiaryAccountId);

    await this.synchronizeBeneficiaryAccount.execute(record);
  }
}
