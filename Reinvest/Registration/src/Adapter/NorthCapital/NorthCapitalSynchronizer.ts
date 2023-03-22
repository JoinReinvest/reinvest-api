import {MainParty} from "Registration/Domain/VendorModel/NorthCapital/MainParty";
import {NorthCapitalAdapter} from "Registration/Adapter/NorthCapital/NorthCapitalAdapter";
import {
    NorthCapitalSynchronizationRepository
} from "Registration/Adapter/Database/Repository/NorthCapitalSynchronizationRepository";
import {NorthCapitalEntityType} from "Registration/Adapter/NorthCapital/NorthCapitalSynchronizationRecord";

export class NorthCapitalSynchronizer {
    static getClassName = () => 'NorthCapitalSynchronizer';
    private northCapitalAdapter: NorthCapitalAdapter;
    private northCapitalSynchronizationRepository: NorthCapitalSynchronizationRepository;

    constructor(northCapitalAdapter: NorthCapitalAdapter, northCapitalSynchronizationRepository: NorthCapitalSynchronizationRepository) {
        this.northCapitalAdapter = northCapitalAdapter;
        this.northCapitalSynchronizationRepository = northCapitalSynchronizationRepository;
    }

    async synchronizeMainParty(recordId: string, mainParty: MainParty): Promise<void> {
        try {
            const synchronizationRecord = await this.northCapitalSynchronizationRepository.getSynchronizationRecord(recordId);

            if (synchronizationRecord.isOutdated(mainParty.getCrc())) {
                await this.northCapitalAdapter.updateParty(synchronizationRecord.getNorthCapitalId(), mainParty);
                await this.northCapitalSynchronizationRepository.updateSynchronizationRecord(synchronizationRecord, mainParty.getCrc());
            }
        } catch (error: any) {
            const partyId = await this.northCapitalAdapter.createParty(mainParty);
            await this.northCapitalSynchronizationRepository.createSynchronizationRecord(recordId, partyId, mainParty.getCrc(), NorthCapitalEntityType.PARTY);
        }
    }


}
