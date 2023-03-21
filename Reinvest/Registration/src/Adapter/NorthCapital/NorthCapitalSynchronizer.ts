import {MainParty} from "Registration/Domain/VendorModel/NorthCapital/MainParty";
import {NorthCapitalAdapter} from "Registration/Adapter/NorthCapital/NorthCapitalAdapter";

export class NorthCapitalSynchronizer {
    static getClassName = () => 'NorthCapitalSynchronizer';
    private northCapitalAdapter: NorthCapitalAdapter;

    constructor(northCapitalAdapter: NorthCapitalAdapter) {
        this.northCapitalAdapter = northCapitalAdapter;
    }

    async synchronizeMainParty(mainParty: MainParty): Promise<void> {
        console.log(`Synchronization of main party`);
    }


}
