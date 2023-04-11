import { GetObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileType } from 'Documents/Adapter/S3/FileLinkService';

export type S3Config = {
  avatarsBucket: string;
  documentsBucket: string;
  region: string;
};

export class S3Adapter {
  private config: S3Config;

  constructor(config: S3Config) {
    this.config = config;
  }

  public static getClassName = (): string => 'S3Adapter';

  public async generatePutSignedUrlForAvatar(catalog: string, fileName: string): Promise<string> {
    return this.generatePutSignedUrl(this.config.avatarsBucket, catalog, fileName);
  }

  public async generatePutSignedUrlForDocument(catalog: string, fileName: string): Promise<string> {
    return this.generatePutSignedUrl(this.config.documentsBucket, catalog, fileName);
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

  private async generatePutSignedUrl(bucketName: string, catalog: string, fileName: string): Promise<string> {
    const client = new S3Client({
      region: this.config.region,
    });

    const putInput: PutObjectCommandInput = {
      Bucket: bucketName,
      Key: `${catalog}/${fileName}`,
      ACL: 'public-read',
    };
    const putCommand = new PutObjectCommand(putInput);

    return getSignedUrl(client, putCommand, { expiresIn: 3600 });
  }
}
