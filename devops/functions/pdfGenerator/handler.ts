import { SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';
import { CHROMIUM_ENDPOINT, S3_CONFIG, SQS_CONFIG } from 'Reinvest/config';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';

import { GeneratePdf } from './src/GeneratePdf';
import { PdfGenerator } from './src/Puppeteer/PdfGenerator';
import { S3Adapter } from './src/S3/S3Adapter';

export const main: SQSHandler = async (event: SQSEvent) => {
  const record = event.Records.pop() as SQSRecord;

  try {
    const {
      data: { catalog, fileName, template, templateType },
      id,
    } = JSON.parse(record.body);
    console.log({ catalog, fileName });
    const { generatePdf, queueSender } = boot();
    await generatePdf.execute(catalog, fileName, template, templateType);
    await queueSender.send(
      JSON.stringify({
        kind: 'PdfGenerated',
        id,
        data: {
          profileId: catalog,
          fileName,
          type: templateType,
        },
      }),
    );
    // send event back
  } catch (error: any) {
    console.log(error);
  }
};

function boot(): {
  generatePdf: GeneratePdf;
  queueSender: QueueSender;
} {
  const s3Config = S3_CONFIG;
  const s3Adapter = new S3Adapter({ region: s3Config.region, bucketName: s3Config.documentsBucket });
  const pdfGenerator = new PdfGenerator(CHROMIUM_ENDPOINT);
  const queueSender = new QueueSender(SQS_CONFIG);

  return {
    generatePdf: new GeneratePdf(s3Adapter, pdfGenerator),
    queueSender,
  };
}
