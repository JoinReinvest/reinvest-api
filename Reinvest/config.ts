import * as dotenv from "dotenv";

dotenv.config({path: `./.env.${process.env.NODE_ENV}`});

export const NORTH_CAPITAL_CONFIG = {
    CLIENT_ID: process.env.NORTH_CAPITAL_CLIENT_ID as string,
    DEVELOPER_API_KEY: process.env.NORTH_CAPITAL_DEVELOPER_API_KEY as string,
    API_URL: process.env.NORTH_CAPITAL_API_URL as string,
    OFFERING_ID: process.env.NORTH_CAPITAL_OFFERING_ID as string,
};

export const VERTALO_CONFIG = {
    CLIENT_ID: process.env.VERTALO_CLIENT_ID as string,
    CLIENT_SECRET: process.env.VERTALO_CLIENT_SECRET as string,
    API_URL: process.env.VERTALO_API_URL as string,
};

export const WEB_APP_URL = process.env.WEB_APP_URL?.replace(/\/*$/, '') as string;

export const DATABASE_CONFIG = {
    host: process.env.POSTGRESQL_HOST as string,
    user: process.env.POSTGRESQL_USER as string,
    password: process.env.POSTGRESQL_PASSWORD as string,
    database: process.env.POSTGRESQL_DB as string,
}

export const S3_CONFIG = {
    region: process.env.INFRASTRUCTURE_AWS_REGION as string,
    avatarsBucket: process.env.S3_BUCKET_AVATARS as string,
    documentsBucket: process.env.S3_BUCKET_DOCUMENTS as string,
}

export const COGNITO_CONFIG = {
    region: process.env.INFRASTRUCTURE_AWS_REGION as string,
    userPoolID: process.env.CognitoUserPoolID as string,
    localClientId: process.env.LocalCognitoClientId as string,
    isLocal: process.env.IT_IS_LOCAL === 'true',
}

export const SNS_CONFIG = {
    region: process.env.INFRASTRUCTURE_AWS_REGION as string,
}
export const SQS_CONFIG = {
    region: process.env.INFRASTRUCTURE_AWS_REGION as string,
    queueUrl: process.env.SQS_QUEUE_URL as string,
    isLocal: process.env.IT_IS_LOCAL === 'true',
}

export const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN as string;

