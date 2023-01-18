import {boot} from "Reinvest/bootstrap";
import {MigrationManager} from "PostgreSQL/MigrationManager";
import Modules from "Reinvest/Modules";
import {NoMigrationException} from "PostgreSQL/NoMigrationException";

const [_, __, command] = process.argv;

const modules: Modules = boot();

for (let module of modules.iterate()) {
    if ('migration' in module) {
        try {
            const migrationManager = module.migration() as MigrationManager;
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
        } catch (exception: any | NoMigrationException) {
            continue;
        }
    }
}
