import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { MappedType } from 'Registration/Domain/Model/Mapping/MappedType';
import { ImmediateSynchronize } from 'Registration/IntegrationLogic/UseCase/ImmediateSynchronize';
import { SynchronizeCompanyAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeCompanyAccount';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class CompanyAccountOpenedEventHandler implements EventHandler<DomainEvent> {
  private mappingRegistryRepository: MappingRegistryRepository;
  private synchronizeCompanyAccount: SynchronizeCompanyAccount;
  private immediateSynchronizationUseCase: ImmediateSynchronize;

  constructor(
    mappingRegistryRepository: MappingRegistryRepository,
    synchronizeCompanyAccount: SynchronizeCompanyAccount,
    immediateSynchronizationUseCase: ImmediateSynchronize,
  ) {
    this.mappingRegistryRepository = mappingRegistryRepository;
    this.synchronizeCompanyAccount = synchronizeCompanyAccount;
    this.immediateSynchronizationUseCase = immediateSynchronizationUseCase;
  }

  static getClassName = (): string => 'CompanyAccountOpenedEventHandler';

  public async handle(event: DomainEvent): Promise<void> {
    const { id: profileId } = event;
    let accountId = null;
    let mappedType = null;

    if (event.kind === 'CorporateAccountOpened') {
      accountId = event.data.corporateAccountId;
      mappedType = MappedType.CORPORATE_ACCOUNT;
    } else if (event.kind === 'TrustAccountOpened') {
      accountId = event.data.trustAccountId;
      mappedType = MappedType.TRUST_ACCOUNT;
    } else {
      return;
    }

    const record = await this.mappingRegistryRepository.addRecord(mappedType, profileId, accountId);

    await this.synchronizeCompanyAccount.execute(record);
    await this.immediateSynchronizationUseCase.immediatelySynchronizeAllAccountStructure(profileId, accountId);
  }
}
