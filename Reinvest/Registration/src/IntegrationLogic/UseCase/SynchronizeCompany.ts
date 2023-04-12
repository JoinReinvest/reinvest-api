import {AbstractSynchronize} from "Registration/IntegrationLogic/UseCase/AbstractSynchronize";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {LegalEntitiesService} from "Registration/Adapter/Modules/LegalEntitiesService";
import {NorthCapitalMapper} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalMapper";
import {MappedRecord} from "Registration/Domain/Model/Mapping/MappedRecord";
import {NorthCapitalSynchronizer} from "../../Adapter/NorthCapital/NorthCapitalSynchronizer";
import {CompanyForSynchronization} from "Registration/Domain/Model/Account";

export class SynchronizeCompany extends AbstractSynchronize {
    static getClassName = () => 'SynchronizeCompany';
    private legalEntitiesService: LegalEntitiesService;
    private northCapitalSynchronizer: NorthCapitalSynchronizer;

    constructor(
        mappingRegistryRepository: MappingRegistryRepository,
        legalEntitiesService: LegalEntitiesService,
        northCapitalSynchronizer: NorthCapitalSynchronizer,
    ) {
        super(mappingRegistryRepository);
        this.legalEntitiesService = legalEntitiesService;
        this.northCapitalSynchronizer = northCapitalSynchronizer;
    }

    async execute(record: MappedRecord): Promise<boolean> {
        if (!record.isCompany() || !await this.lockExecution(record)) {
            return false;
        }
        try {
            console.log(`[START] Company synchronization, recordId: ${record.getRecordId()}`);
            const company = await this.legalEntitiesService.getCompany(record.getProfileId(), record.getExternalId());

            const northCapitalStatus = await this.synchronizeNorthCapital(record, company);

            if (northCapitalStatus) {
                await this.setCleanAndUnlockExecution(record);
                console.log(`[SUCCESS] Company synchronized, recordId: ${record.getRecordId()}`);
                return true;
            } else {
                console.error(`[FAILED] Company synchronization FAILED, recordId: ${record.getRecordId()}`);
                await this.unlockExecution(record);
            }
        } catch (error: any) {
            console.error(`[FAILED] Company synchronization FAILED with error, recordId: ${record.getRecordId()}`, error);
            await this.unlockExecution(record);
        }

        return false;
    }

    private async synchronizeNorthCapital(record: MappedRecord, company: CompanyForSynchronization): Promise<boolean> {
        try {
            const northCapitalCompanyEntity = NorthCapitalMapper.mapCompany(company, record.getEmail());
            await this.northCapitalSynchronizer.synchronizeCompanyEntity(record.getRecordId(), northCapitalCompanyEntity);
            await this.northCapitalSynchronizer.synchronizeLinks(record.getRecordId(), northCapitalCompanyEntity.getLinksConfiguration());

            console.log(`[North Capital SUCCESS] Company synchronized, recordId: ${record.getRecordId()}`);
            return true;
        } catch (error: any) {
            console.error(`[North Capital FAILED] North Capital Company synchronization FAILED, recordId: ${record.getRecordId()}`, error);
            return false;
        }
    }
}