import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { MappedType } from 'Registration/Domain/Model/Mapping/MappedType';
import { SynchronizeIndividualAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeIndividualAccount';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class IndividualAccountOpenedEventHandler implements EventHandler<DomainEvent> {
  private mappingRegistryRepository: MappingRegistryRepository;
  private synchronizeIndividualAccount: SynchronizeIndividualAccount;

  constructor(mappingRegistryRepository: MappingRegistryRepository, synchronizeIndividualAccount: SynchronizeIndividualAccount) {
    this.mappingRegistryRepository = mappingRegistryRepository;
    this.synchronizeIndividualAccount = synchronizeIndividualAccount;
  }

  static getClassName = (): string => 'IndividualAccountOpenedEventHandler';

  public async handle(event: DomainEvent): Promise<void> {
    const {
      id: profileId,
      data: { individualAccountId },
    } = event;
    const record = await this.mappingRegistryRepository.addRecord(MappedType.INDIVIDUAL_ACCOUNT, profileId, individualAccountId);

    await this.synchronizeIndividualAccount.execute(record);
  }
}
