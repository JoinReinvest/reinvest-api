import { migrate } from 'Reinvest/migration';

export const main = async (event: any, context: any, callback: any) => {
  const migrationType = event === 'down' ? 'migrateDown' : 'migrateLatest';
  try {
    console.log('Starting migration: ' + migrationType);
    await migrate(migrationType);
    console.log('Migration finished!');
  } catch (error: any) {
    callback(error, { event, migrationType, status: false });
    console.log({ error });

    return;
  }

  callback(null, { event, migrationType, status: true });
};
