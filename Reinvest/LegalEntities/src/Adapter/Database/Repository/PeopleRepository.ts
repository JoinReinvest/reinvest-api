import {DatabaseAdapter} from "LegalEntities/Adapter/Database/DatabaseAdapter";

export class PeopleRepository {
    public static getClassName = (): string => "PeopleRepository";
    private databaseAdapter: DatabaseAdapter;

    constructor(databaseAdapter: DatabaseAdapter) {
        this.databaseAdapter = databaseAdapter;
    }
}