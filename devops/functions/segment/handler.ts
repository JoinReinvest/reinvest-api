import { Analytics } from '@segment/analytics-node';
import { SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';
import { logger } from 'Logger/logger';
import { DateTime } from 'Money/DateTime';
import { SEGMENT_API_KEY, SENTRY_CONFIG } from 'Reinvest/config';

console = logger(SENTRY_CONFIG);
const analytics = new Analytics({ writeKey: SEGMENT_API_KEY });

export type SegmentEventData = {
  eventName: string;
  profileId: string;
  sendIdentity: boolean;
  data?: Record<string, any>;
  identityData?: Record<string, any>;
};

export const main: SQSHandler = async (event: SQSEvent) => {
  const record = event.Records.pop() as SQSRecord;

  try {
    const { profileId, identityData, eventName, data, sendIdentity } = JSON.parse(record.body) as SegmentEventData;
    const timestamp = DateTime.now().toDate();

    if (sendIdentity) {
      analytics.identify({
        userId: profileId,
        traits: identityData ?? {}, // https://segment.com/docs/connections/spec/identify/#traits
        timestamp,
      });
    }

    // https://segment.com/docs/connections/sources/catalog/libraries/server/node/#track
    analytics.track({
      userId: profileId,
      event: eventName,
      properties: data ?? {},
      timestamp,
    });

    analytics.on('error', err => console.error(err));

    await analytics.closeAndFlush({ timeout: 2800 });
  } catch (error: any) {
    console.log(error);
  }
};
