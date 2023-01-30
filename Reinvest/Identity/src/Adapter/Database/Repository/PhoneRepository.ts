import {DatabaseAdapter} from "Identity/Adapter/Database/DatabaseAdapter";

export class PhoneRepository {
    public static getClassName = (): string => "PhoneRepository";
    private databaseAdapter: DatabaseAdapter;

    constructor(databaseAdapter: DatabaseAdapter) {
        this.databaseAdapter = databaseAdapter;
    }
}