import { SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';
import { PdfTypes } from 'devops/functions/pdfGenerator/src/Types';
import { CHROMIUM_ENDPOINT, S3_CONFIG, SQS_CONFIG } from 'Reinvest/config';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';

import { GeneratePdf } from './src/GeneratePdf';
import { PdfGenerator } from './src/Puppeteer/PdfGenerator';
import { S3Adapter } from './src/S3/S3Adapter';

export type GeneratePdfCommand = {
  data: {
    catalog: string;
    fileName: string;
    template: string;
    templateType: PdfTypes;
  };
  id: string;
  kind: 'GeneratePdf';
};

export type MakeScreenshotToPDf = {
  data: {
    catalog: string;
    fileName: string;
    url: string;
  };
  id: string;
  kind: 'MakeScreenshotToPDf';
};

export const main: SQSHandler = async (event: SQSEvent) => {
  const record = event.Records.pop() as SQSRecord;

  try {
    const data = JSON.parse(record.body);
    const { kind } = data;
    const { generatePdf, queueSender } = boot();

    if (!kind || kind === 'GeneratePdf') {
      const {
        data: { catalog, fileName, template, templateType },
        id,
      } = data;
      console.log({ catalog, fileName });
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
    }

    if (kind === 'MakeScreenshotToPDf') {
      // todo screenshot
    }
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
