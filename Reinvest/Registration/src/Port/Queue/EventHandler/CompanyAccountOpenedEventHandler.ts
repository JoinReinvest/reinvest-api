import {EventHandler} from "SimpleAggregator/EventBus/EventBus";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {MappedType} from "Registration/Domain/Model/Mapping/MappedType";
import {DomainEvent} from "SimpleAggregator/Types";
import {SynchronizeCompanyAccount} from "Registration/IntegrationLogic/UseCase/SynchronizeCompanyAccount";

export class CompanyAccountOpenedEventHandler implements EventHandler<DomainEvent> {
    static getClassName = (): string => 'IndividualAccountOpenedEventHandler';
    private mappingRegistryRepository: MappingRegistryRepository;
    private synchronizeCompanyAccount: SynchronizeCompanyAccount;

    constructor(mappingRegistryRepository: MappingRegistryRepository, synchronizeCompanyAccount: SynchronizeCompanyAccount) {
        this.mappingRegistryRepository = mappingRegistryRepository;
        this.synchronizeCompanyAccount = synchronizeCompanyAccount;
    }

    public async handle(event: DomainEvent): Promise<void> {
        const {id: profileId} = event;
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
    }
}