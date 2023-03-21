import {AbstractSynchronize} from "Registration/IntegrationLogic/UseCase/AbstractSynchronize";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {LegalEntitiesService} from "Registration/Adapter/Modules/LegalEntitiesService";
import {NorthCapitalMapper} from "Registration/IntegrationLogic/Mapper/NorthCapitalMapper";
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

    async execute(record: MappedRecord): Promise<void> {
        if (!record.isProfile() || !await this.lockExecution(record)) {
            return;
        }

        console.log(`Synchronization of recordId: ${record.getRecordId()}`);
        const profile = await this.legalEntitiesService.getProfile(record.getProfileId());
        const northCapitalMainParty = NorthCapitalMapper.mapProfile(profile, record.getEmail());
        await this.northCapitalSynchronizer.synchronizeMainParty(northCapitalMainParty);


        // compare and store crc in the db
        // synchronize party with North Capital

        await this.unlockExecution(record)
    }
}