import { MigrationResultSet, Migrator } from 'kysely';
import { Migration } from 'kysely/dist/cjs/migration/migrator';
import { DatabaseProvider } from 'PostgreSQL/DatabaseProvider';

export type MigrationConfig = { migrations: Promise<Record<string, Migration>> };

export class MigrationManager {
  private readonly config: MigrationConfig;
  private databaseProvider: DatabaseProvider<any>;

  constructor(databaseProvider: DatabaseProvider<any>, config: MigrationConfig) {
    this.config = config;
    this.databaseProvider = databaseProvider;
  }

  private async run(callback: (migrator: Migrator) => Promise<MigrationResultSet>) {
    const db = this.databaseProvider.provide();
    const migrator = new Migrator({
      db,
      provider: { getMigrations: () => this.config.migrations },
    });

    const { error, results } = await callback(migrator);
    results?.forEach(it => {
      if (it.status === 'Success') {
        console.log(`Migration "${it.migrationName}" was executed successfully`);
      } else if (it.status === 'Error') {
        console.error(`Failed to execute migration "${it.migrationName}"`);
      }
    });

    if (error) {
      console.error(`Failed to migrate`);
      console.error(error);
      process.exit(1);
    } else if (typeof results === 'undefined' || results.length === 0) {
      console.log(`No migrations to execute`);
    }

    await db.destroy();
  }

  async migrateUp() {
    return await this.run(async migrator => {
      return await migrator.migrateUp();
    });
  }

  async migrateDown() {
    return await this.run(async migrator => {
      return await migrator.migrateDown();
    });
  }

  async migrateToLatest() {
    return await this.run(async migrator => {
      return await migrator.migrateToLatest();
    });
  }
}
