import { Migration } from 'kysely/dist/cjs/migration/migrator';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { MigrationManager } from 'PostgreSQL/MigrationManager';
import { NoMigrationException } from 'PostgreSQL/NoMigrationException';
import { boot } from 'Reinvest/bootstrap';
import { DATABASE_CONFIG } from 'Reinvest/config';
import Modules from 'Reinvest/Modules';

export async function migrate(command: 'migrateLatest' | 'migrateUp' | 'migrateDown') {
  const modules: Modules = boot();
  let allMigrations = {} as Promise<Record<string, Migration>>;

  for (const module of modules.iterate()) {
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
    migrations: allMigrations,
  });
  switch (command) {
    case 'migrateLatest':
      await migrationManager.migrateToLatest();
      break;
    case 'migrateUp':
      await migrationManager.migrateUp();
      break;
    case 'migrateDown':
      await migrationManager.migrateDown();
      break;
    default:
      console.error(`Wrong CLI command: ${command}`);
  }

  await modules.close();
}
