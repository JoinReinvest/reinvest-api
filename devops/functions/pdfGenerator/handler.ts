import { SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';
import { CHROMIUM_ENDPOINT, S3_CONFIG } from 'Reinvest/config';

import { GeneratePdf } from './src/GeneratePdf';
import { PdfGenerator } from './src/Puppeteer/PdfGenerator';
import { S3Adapter } from './src/S3/S3Adapter';

export const main: SQSHandler = async (event: SQSEvent) => {
  const record = event.Records.pop() as SQSRecord;

  try {
    const messageId = record.messageId;
    const {
      data: { catalog, fileName, template, templateType },
      kind,
    } = JSON.parse(record.body);
    console.log({ catalog, fileName });
    const { generatePdf } = boot();
    await generatePdf.execute(catalog, fileName, template, templateType);
    // send event back
  } catch (error: any) {
    console.log(error);
  }
};

function boot(): {
  generatePdf: GeneratePdf;
} {
  const s3Config = S3_CONFIG;
  const s3Adapter = new S3Adapter({ region: s3Config.region, bucketName: s3Config.documentsBucket });
  const pdfGenerator = new PdfGenerator(CHROMIUM_ENDPOINT);

  return {
    generatePdf: new GeneratePdf(s3Adapter, pdfGenerator),
  };
}
