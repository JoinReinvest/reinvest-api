import { sql } from 'kysely';
import { DatabaseProvider } from 'PostgreSQL/DatabaseProvider';

export class TransactionalAdapter<Database> {
  static getClassName = (): string => 'TransactionalAdapter';
  private databaseProvider: DatabaseProvider<Database>;

  constructor(databaseProvider: DatabaseProvider<Database>) {
    this.databaseProvider = databaseProvider;
  }

  public async transaction(transactionName: string, callback: Function): Promise<boolean> {
    const db = this.databaseProvider.provide();

    console.log(`[BEGIN Transaction]: ${transactionName}`);
    await sql`BEGIN TRANSACTION`.execute(db);
    try {
      await callback();
      await sql`COMMIT`.execute(db);
      console.log(`[COMMIT Transaction] ${transactionName}`);

      return true;
    } catch (error: any) {
      console.log(`[ROLLBACK Transaction] "${transactionName}" failed with message "${error.message}"`);
      console.error(error);
      await sql`ROLLBACK`.execute(db);

      return false;
    }
  }
}
