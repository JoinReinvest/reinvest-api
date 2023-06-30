import { SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';
import admin from 'firebase-admin';

import { firebaseServiceAccount } from './accountService';

export const main: SQSHandler = async (event: SQSEvent) => {
  const record = event.Records.pop() as SQSRecord;

  try {
    const { token, title, body } = JSON.parse(record.body);

    admin.initializeApp({
      credential: admin.credential.cert(firebaseServiceAccount),
    });

    const message = {
      token,
      notification: {
        title,
        body,
      },
    };

    await admin.messaging().send(message);
  } catch (error: any) {
    console.log(error);
  }
};
