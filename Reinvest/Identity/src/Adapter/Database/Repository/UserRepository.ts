import {DatabaseAdapter} from "Identity/Adapter/Database/DatabaseAdapter";
import {IdGeneratorInterface} from "IdGenerator/IdGenerator";

export class UserRepository {
    public static getClassName = (): string => "UserRepository";
    private databaseAdapter: DatabaseAdapter;
    private idGenerator: IdGeneratorInterface;

    constructor(databaseAdapter: DatabaseAdapter, idGenerator: IdGeneratorInterface) {
        this.databaseAdapter = databaseAdapter;
        this.idGenerator = idGenerator;
    }

    async createUser(userId: string, email: string, isVerified: boolean, incentiveToken: string | null): Promise<string> {
        return this.idGenerator.create();
    }
}