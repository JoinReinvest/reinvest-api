import {
    GetObjectCommand,
    PutObjectCommand,
    PutObjectCommandInput,
    S3Client,
} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";


export type S3Config = {
    region: string,
    avatarsBucket: string,
    documentsBucket: string
}

export class S3Adapter {
    public static toString = () => "S3Adapter";
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
            region: this.config.region
        });

        const putInput: PutObjectCommandInput = {
            Bucket: bucketName,
            Key: `${catalog}/${fileName}`,
            ACL: 'public-read'
        };
        const putCommand = new PutObjectCommand(putInput);

        return getSignedUrl(client, putCommand, {expiresIn: 3600});
    }

    public getSignedGetUrl() {

        // const getCommand = new GetObjectCommand({
        //     Bucket: 'lukaszd-staging-avatars',
        //     Key: 'tomasz.jpeg'
        // });
        // const getUrl = await getSignedUrl(client, getCommand, {expiresIn: 3600});
    }

}

