import {boot} from "Reinvest/bootstrap";
import {MigrationManager} from "PostgreSQL/MigrationManager";
import Modules from "Reinvest/Modules";

const [_, __, command] = process.argv;

const modules: Modules = boot();

for (let module of modules.iterate()) {
    if ('migration' in module) {
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
    }
}
