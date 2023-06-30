import { SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';
import admin from 'firebase-admin';
import { FIREBASE_SERVICE_ACCOUNT_JSON } from 'Reinvest/config';

export const main: SQSHandler = async (event: SQSEvent) => {
  const record = event.Records.pop() as SQSRecord;

  try {
    const {
      data: { token, title, body },
    } = JSON.parse(record.body);

    admin.initializeApp({
      credential: admin.credential.cert(<admin.ServiceAccount>JSON.parse(FIREBASE_SERVICE_ACCOUNT_JSON)),
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
