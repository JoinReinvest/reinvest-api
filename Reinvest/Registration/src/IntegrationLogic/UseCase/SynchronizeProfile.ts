import {AbstractSynchronize} from "Registration/IntegrationLogic/UseCase/AbstractSynchronize";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {LegalEntitiesService} from "Registration/Adapter/Modules/LegalEntitiesService";
import {NorthCapitalMapper} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalMapper";
import {MappedRecord} from "Registration/Domain/Model/Mapping/MappedRecord";
import {NorthCapitalSynchronizer} from "../../Adapter/NorthCapital/NorthCapitalSynchronizer";

export class SynchronizeProfile extends AbstractSynchronize {
    static getClassName = () => 'SynchronizeProfile';
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
        if (!record.isProfile() || !await this.lockExecution(record)) {
            return false;
        }

        try {
            console.log(`[START] Profile synchronization, recordId: ${record.getRecordId()}`);
            const profile = await this.legalEntitiesService.getProfile(record.getProfileId());

            const northCapitalMainParty = NorthCapitalMapper.mapProfile(profile, record.getEmail());
            await this.northCapitalSynchronizer.synchronizeMainParty(record.getRecordId(), northCapitalMainParty);

            await this.setCleanAndUnlockExecution(record);
            console.log(`[FINISHED] Profile synchronization, recordId: ${record.getRecordId()}`);
            return true;
        } catch (error: any) {
            console.error(`[FAILED] Profile synchronization, recordId: ${record.getRecordId()}`, error);
            await this.unlockExecution(record);
        }
        return false;
    }
}