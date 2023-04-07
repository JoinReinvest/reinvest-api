import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {SynchronizeCompany} from "Registration/IntegrationLogic/UseCase/SynchronizeCompany";
import {MappedType} from "Registration/Domain/Model/Mapping/MappedType";
import {SynchronizeProfile} from "Registration/IntegrationLogic/UseCase/SynchronizeProfile";
import {SynchronizeIndividualAccount} from "Registration/IntegrationLogic/UseCase/SynchronizeIndividualAccount";
import {SynchronizeCompanyAccount} from "Registration/IntegrationLogic/UseCase/SynchronizeCompanyAccount";

export class SynchronizationController {
    public static getClassName = (): string => "SynchronizationController";
    private mappingRegistryRepository: MappingRegistryRepository;
    private synchronizeProfileUseCase: SynchronizeProfile;
    private synchronizeIndividualAccountUseCase: SynchronizeIndividualAccount;
    private synchronizeCompanyAccountUseCase: SynchronizeCompanyAccount;
    private synchronizeCompanyUseCase: SynchronizeCompany;

    constructor(mappingRegistryRepository: MappingRegistryRepository,
                synchronizeProfileUseCase: SynchronizeProfile,
                synchronizeIndividualAccountUseCase: SynchronizeIndividualAccount,
                synchronizeCompanyAccountUseCase: SynchronizeCompanyAccount,
                synchronizeCompanyUseCase: SynchronizeCompany
    ) {
        this.synchronizeProfileUseCase = synchronizeProfileUseCase;
        this.synchronizeIndividualAccountUseCase = synchronizeIndividualAccountUseCase;
        this.synchronizeCompanyAccountUseCase = synchronizeCompanyAccountUseCase;
        this.mappingRegistryRepository = mappingRegistryRepository;
        this.synchronizeCompanyUseCase = synchronizeCompanyUseCase;
    }

    public async synchronize(recordId: string): Promise<boolean> {
        const record = await this.mappingRegistryRepository.getRecordById(recordId);
        console.log({recordToSync: record});
        // levels of synchronization? ie. do not synchronize stakeholder/company
        // if company was not synchronized or do not synchronize account if profile not synchronized
        switch (record.getMappedType()) {
            case MappedType.COMPANY:
                return await this.synchronizeCompanyUseCase.execute(record);
            case MappedType.STAKEHOLDER:
                return true;
            case MappedType.PROFILE:
                return await this.synchronizeProfileUseCase.execute(record);
            case MappedType.INDIVIDUAL_ACCOUNT:
                return await this.synchronizeIndividualAccountUseCase.execute(record);
            case MappedType.CORPORATE_ACCOUNT:
            case MappedType.TRUST_ACCOUNT:
                return await this.synchronizeCompanyAccountUseCase.execute(record);
            default:
                console.error(`[FAILED] Record type not implemented, recordId: ${record.getRecordId()}`);
                return false;
        }
    }
}
