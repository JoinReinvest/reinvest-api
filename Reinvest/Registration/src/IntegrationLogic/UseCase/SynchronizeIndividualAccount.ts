import {AbstractSynchronize} from "Registration/IntegrationLogic/UseCase/AbstractSynchronize";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {LegalEntitiesService} from "Registration/Adapter/Modules/LegalEntitiesService";
import {NorthCapitalMapper} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalMapper";
import {MappedRecord} from "Registration/Domain/Model/Mapping/MappedRecord";
import {NorthCapitalSynchronizer} from "../../Adapter/NorthCapital/NorthCapitalSynchronizer";

export class SynchronizeIndividualAccount extends AbstractSynchronize {
    static getClassName = () => 'SynchronizeIndividualAccount';
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
        if (!record.isIndividualAccount() || !await this.lockExecution(record)) {
            return;
        }

        console.log(`[START] Individual account synchronization, recordId: ${record.getRecordId()}`);
        const individualAccount = await this.legalEntitiesService.getIndividualAccount(record.getProfileId(), record.getExternalId());
        if (individualAccount === null) {
            console.error(`Individual account not found: ${record.getProfileId()}/${record.getExternalId()}`);
            await this.unlockExecution(record);
            return;
        }

        const northCapitalIndividualAccount = NorthCapitalMapper.mapIndividualAccount(individualAccount);
        // await this.northCapitalSynchronizer.synchronizeMainParty(record.getRecordId(), northCapitalMainParty);

        await this.setCleanAndUnlockExecution(record)

        console.log(`[FINISHED] Individual account synchronization, recordId: ${record.getRecordId()}`);
    }
}