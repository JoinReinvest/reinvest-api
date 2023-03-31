import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

export type PostgreSQLConfig = { database: string; host: string; password: string; user: string };

export class DatabaseProvider<Database> {
  private readonly config: PostgreSQLConfig;
  private instance: Kysely<Database> | null = null;

  constructor(config: PostgreSQLConfig) {
    this.config = config;
  }

  provide(): Kysely<Database> {
    if (this.instance === null) {
      this.instance = new Kysely<Database>({
        dialect: new PostgresDialect({
          pool: new Pool(this.config),
        }),
      });
    }
    return this.instance;
  }

  async close() {
    if (this.instance === null) {
      return;
    }

    await this.instance.destroy();
    this.instance = null;
  }
}
