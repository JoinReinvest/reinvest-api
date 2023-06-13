import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileType } from 'Documents/Adapter/S3/FileLinkService';
import { Stream } from 'stream';

export type S3Config = {
  avatarsBucket: string;
  documentsBucket: string;
  region: string;
};

export class S3Adapter {
  public static getClassName = (): string => 'S3Adapter';
  private config: S3Config;

  constructor(config: S3Config) {
    this.config = config;
  }

  public async generatePutSignedUrlForAvatar(catalog: string, fileName: string): Promise<string> {
    return this.generatePutSignedUrl(this.config.avatarsBucket, catalog, fileName);
  }

  public async generatePutSignedUrlForDocument(catalog: string, fileName: string): Promise<string> {
    return this.generatePutSignedUrl(this.config.documentsBucket, catalog, fileName);
  }

  private async generatePutSignedUrl(bucketName: string, catalog: string, fileName: string): Promise<string> {
    const client = new S3Client({
      region: this.config.region,
    });

    const putInput: PutObjectCommandInput = {
      Bucket: bucketName,
      Key: `${catalog}/${fileName}`,
      ACL: 'private',
    };
    const putCommand = new PutObjectCommand(putInput);

    return getSignedUrl(client, putCommand, { expiresIn: 3600 });
  }

  async uploadBufferPdf(catalog: string, fileName: string, buffer: any) {
    const client = new S3Client({
      region: this.config.region,
    });

    const stream = new Stream.PassThrough();

    const parallelUploads3 = new Upload({
      client,
      params: {
        Bucket: this.config.documentsBucket,
        Key: `${catalog}/${fileName}`,
        Body: stream,
        ContentType: 'application/pdf',
        ACL: 'private',
      },
    });
    buffer.pipe(stream);

    await parallelUploads3.done();

    return true;
  }

  public async getSignedGetUrl(type: FileType, catalog: string, fileName: string) {
    const client = new S3Client({
      region: this.config.region,
    });

    const bucketName = type === FileType.AVATAR ? this.config.avatarsBucket : this.config.documentsBucket;

    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: `${catalog}/${fileName}`,
    });

    return getSignedUrl(client, getCommand, { expiresIn: 3600 });
  }

  async deleteFile(catalog: string, fileName: string, fileType: FileType): Promise<boolean> {
    const client = new S3Client({
      region: this.config.region,
    });

    const bucketName = fileType === FileType.AVATAR ? this.config.avatarsBucket : this.config.documentsBucket;

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: `${catalog}/${fileName}`,
    });

    await client.send(command);

    return true;
  }
}
