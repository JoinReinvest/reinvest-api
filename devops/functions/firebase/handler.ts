import { SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';
import admin from 'firebase-admin';
import { logger } from 'Logger/logger';
import { SENTRY_CONFIG } from 'Reinvest/config';

import { getFirebaseServiceAccount } from './accountService';

console = logger(SENTRY_CONFIG);

const firebaseApp = {
  initialized: false,
  init: async () => {
    if (firebaseApp.initialized) {
      return;
    }

    const serviceAccount = await getFirebaseServiceAccount();
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseApp.initialized = true;
  },
};

export const main: SQSHandler = async (event: SQSEvent) => {
  const record = event.Records.pop() as SQSRecord;
  await firebaseApp.init();

  try {
    const { token, title, body } = JSON.parse(record.body);

    const message = {
      token,
      notification: {
        title,
        body,
      },
    };
    console.log('Sending message', message);
    await admin.messaging().send(message);
  } catch (error: any) {
    console.warn(error);
  }
};
