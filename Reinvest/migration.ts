import {boot} from "Reinvest/bootstrap";
import {MigrationManager} from "PostgreSQL/MigrationManager";
import Modules from "Reinvest/Modules";
import {NoMigrationException} from "PostgreSQL/NoMigrationException";
import {DatabaseProvider, PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {DATABASE_CONFIG} from "Reinvest/config";
import {Migration} from "kysely/dist/cjs/migration/migrator";

const [_, __, command] = process.argv;

const modules: Modules = boot();
let allMigrations = {} as Promise<Record<string, Migration>>;
for (let module of modules.iterate()) {
    if ('migration' in module) {
        try {
            const moduleMigrations = module.migration();
            allMigrations = Object.assign(allMigrations, moduleMigrations);
        } catch (exception: any | NoMigrationException) {
            continue;
        }
    }
}
const databaseConfig = DATABASE_CONFIG as PostgreSQLConfig;
const databaseProvider = new DatabaseProvider<any>(databaseConfig);
const migrationManager = new MigrationManager(databaseProvider, {
    migrations: allMigrations
});
switch (command) {
    case 'migrateLatest':
        migrationManager.migrateToLatest();
        break;
    case 'migrateUp':
        migrationManager.migrateUp();
        break;
    case 'migrateDown':
        migrationManager.migrateDown();
        break;
    default:
        console.error(`Wrong CLI command: ${command}`);
}
