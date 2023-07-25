import admin from 'firebase-admin';
import { DatabaseProvider } from 'PostgreSQL/DatabaseProvider';
import { DATABASE_CONFIG } from 'Reinvest/config';

export interface SystemConfiguration {
  system_configuration: {
    id: number;
    key: string;
    value: string;
  };
}

export async function getFirebaseServiceAccount(): Promise<admin.ServiceAccount> {
  const result = await getDatabaseProvider()
    .provide()
    .selectFrom('system_configuration')
    .select('value')
    .where('key', '=', 'FIREBASE_SERVICE_ACCOUNT')
    .executeTakeFirst();

  if (!result) {
    console.error('FIREBASE_SERVICE_ACCOUNT not found');
    throw new Error('FIREBASE_SERVICE_ACCOUNT not found');
  }

  return <admin.ServiceAccount>JSON.parse(result.value);
}

function getDatabaseProvider() {
  return new DatabaseProvider<SystemConfiguration>(DATABASE_CONFIG);
}
