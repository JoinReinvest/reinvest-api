import { SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';
import { PdfEvents, PdfKinds } from 'HKEKTypes/Pdf';
import { CHROMIUM_ENDPOINT, S3_CONFIG, SQS_CONFIG } from 'Reinvest/config';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';

import { GeneratePdf } from './src/GeneratePdf';
import { MakeScreenshotToPdf } from './src/MakeScreenshotToPdf';
import { PdfGenerator } from './src/Puppeteer/PdfGenerator';
import { S3Adapter } from './src/S3/S3Adapter';

export const main: SQSHandler = async (event: SQSEvent) => {
  const record = event.Records.pop() as SQSRecord;

  try {
    const data = JSON.parse(record.body);
    const { kind } = data;

    const { generatePdf, queueSender, makeScreenshotToPdf } = boot();

    if (!kind || kind === PdfKinds.GeneratePdf) {
      const {
        data: { catalog, fileName, template, content, version, profileId, fileId },
        id,
      } = data;

      await generatePdf.execute(catalog, fileName, template, version, content);
      await queueSender.send(
        JSON.stringify({
          kind: PdfEvents.PdfGenerated,
          id,
          data: {
            profileId,
            fileId,
          },
        }),
      );
    }

    if (kind === PdfKinds.MakeScreenshotToPdf) {
      const {
        data: { catalog, fileName, url, profileId, fileId },
        id,
      } = data;

      await makeScreenshotToPdf.execute(catalog, fileName, url);
      await queueSender.send(
        JSON.stringify({
          kind: PdfEvents.PdfGenerated,
          id,
          data: {
            profileId,
            fileId,
          },
        }),
      );
    }
  } catch (error: any) {
    console.log(error);
  }
};

function boot(): {
  generatePdf: GeneratePdf;
  makeScreenshotToPdf: MakeScreenshotToPdf;
  queueSender: QueueSender;
} {
  const s3Config = S3_CONFIG;
  const s3Adapter = new S3Adapter({ region: s3Config.region, bucketName: s3Config.documentsBucket });
  const pdfGenerator = new PdfGenerator(CHROMIUM_ENDPOINT);
  const queueSender = new QueueSender(SQS_CONFIG);

  return {
    generatePdf: new GeneratePdf(s3Adapter, pdfGenerator),
    makeScreenshotToPdf: new MakeScreenshotToPdf(s3Adapter, pdfGenerator),
    queueSender,
  };
}
