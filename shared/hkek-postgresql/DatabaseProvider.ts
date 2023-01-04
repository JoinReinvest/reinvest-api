// @ts-ignore
import {Pool} from 'pg'
import {Kysely, PostgresDialect} from "kysely";

export type PostgreSQLConfig = { database: string; password: string; host: string; user: string };

export class DatabaseProvider<Database> {
    private readonly config: PostgreSQLConfig;

    constructor(config: PostgreSQLConfig) {
        this.config = config
    }

    provide(): Kysely<Database> {
        return new Kysely<Database>({
            dialect: new PostgresDialect({
                pool: new Pool(this.config)
            })
        });
    }
}