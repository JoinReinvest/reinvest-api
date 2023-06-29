import { SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda'
import { credential, initializeApp, messaging } from 'firebase-admin'
import { FIREBASE_SERVICE_ACCOUNT_JSON } from 'Reinvest/config'

export const main: SQSHandler = async (event: SQSEvent) => {
    const record = event.Records.pop() as SQSRecord

    try {
        const {
            data: { token, title, body },
        } = JSON.parse(record.body)
        initializeApp({
            credential: credential.cert(FIREBASE_SERVICE_ACCOUNT_JSON),
        })

        const message = {
            token,
            notification: {
                title,
                body,
            },
        }

        await messaging().send(message)
    } catch (error: any) {
        console.log(error)
    }
}
