import {AbstractSynchronize} from "Registration/IntegrationLogic/UseCase/AbstractSynchronize";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {LegalEntitiesService} from "Registration/Adapter/Modules/LegalEntitiesService";
import {NorthCapitalMapper} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalMapper";
import {MappedRecord} from "Registration/Domain/Model/Mapping/MappedRecord";
import {NorthCapitalSynchronizer} from "../../Adapter/NorthCapital/NorthCapitalSynchronizer";
import {StakeholderForSynchronization} from "Registration/Domain/Model/Account";

export class SynchronizeStakeholder extends AbstractSynchronize {
    static getClassName = () => 'SynchronizeStakeholder';
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
        if (!record.isStakeholder() || !await this.lockExecution(record)) {
            return false;
        }
        try {
            console.log(`[START] Stakeholder synchronization, recordId: ${record.getRecordId()}`);
            const stakeholder = await this.legalEntitiesService.getStakeholder(record.getProfileId(), record.getExternalId(), record.getDependentId());

            const northCapitalStatus = await this.synchronizeNorthCapital(record, stakeholder);

            if (northCapitalStatus) {
                await this.setCleanAndUnlockExecution(record);
                console.log(`[SUCCESS] Stakeholder synchronized, recordId: ${record.getRecordId()}`);
                return true;
            } else {
                console.error(`[FAILED] Stakeholder synchronization FAILED, recordId: ${record.getRecordId()}`);
                await this.unlockExecution(record);
            }
        } catch (error: any) {
            console.error(`[FAILED] Stakeholder synchronization FAILED with error, recordId: ${record.getRecordId()}: ${error.message}`);
            await this.unlockExecution(record);
        }

        return false;
    }

    private async synchronizeNorthCapital(record: MappedRecord, stakeholder: StakeholderForSynchronization): Promise<boolean> {
        try {
            const northCapitalStakeholderParty = NorthCapitalMapper.mapStakeholder(stakeholder, record.getEmail());
            await this.northCapitalSynchronizer.synchronizeStakeholderParty(record.getRecordId(), northCapitalStakeholderParty);
            await this.northCapitalSynchronizer.synchronizeLinks(record.getRecordId(), northCapitalStakeholderParty.getLinksConfiguration());

            console.log(`[North Capital SUCCESS] Stakeholder synchronized, recordId: ${record.getRecordId()}`);
            return true;
        } catch (error: any) {
            console.error(`[North Capital FAILED] North Capital Stakeholder synchronization FAILED, recordId: ${record.getRecordId()}: ${error.message}`);
            return false;
        }
    }
}