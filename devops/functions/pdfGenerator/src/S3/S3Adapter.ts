import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

export type S3Config = {
  bucketName: string;
  region: string;
};

export class S3Adapter {
  private config: S3Config;

  constructor(config: S3Config) {
    this.config = config;
  }

  async uploadBufferPdf(catalog: string, fileName: string, buffer: Buffer) {
    const client = new S3Client({
      region: this.config.region,
    });

    console.log(`Uploading PDF to: ${this.config.bucketName}/${catalog}/${fileName}`);
    const parallelUploads3 = new Upload({
      client,
      params: {
        Bucket: this.config.bucketName,
        Key: `${catalog}/${fileName}`,
        Body: buffer,
        ContentType: 'application/pdf',
        ACL: 'public',
      },
    });

    await parallelUploads3.done();

    return true;
  }
}
