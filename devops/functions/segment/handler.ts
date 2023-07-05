import { Analytics } from '@segment/analytics-node'
import { SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';
import { SEGMENT_API_KEY } from 'Reinvest/config'

const analytics = new Analytics({ writeKey: SEGMENT_API_KEY });

export const main: SQSHandler = async (event: SQSEvent) => {
  const record = event.Records.pop() as SQSRecord;

  try {
    const { userId, eventName, timestamp, data, sendIdentify } = JSON.parse(record.body);

    if(sendIdentify){
      analytics.identify({
        userId,
        traits: data, // https://segment.com/docs/connections/spec/identify/#traits
        timestamp
      });
    }

    // https://segment.com/docs/connections/sources/catalog/libraries/server/node/#track
    analytics.track({
      userId,
      event: eventName,
      properties: data,
      timestamp
    });

    analytics.on('error', (err) => console.error(err))

    await analytics.closeAndFlush({ timeout: 5000 })

  } catch (error: any) {
    console.log(error);
  }
};
