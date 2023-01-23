import {DatabaseAdapter} from "LegalEntities/Adapter/Database/DatabaseAdapter";

export class PeopleRepository {
    public static toString = () => "PeopleRepository";
    private databaseAdapter: DatabaseAdapter;

    constructor(databaseAdapter: DatabaseAdapter) {
        this.databaseAdapter = databaseAdapter;
    }
}