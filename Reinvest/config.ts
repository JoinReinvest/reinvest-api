import * as dotenv from 'dotenv';

dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });

export const CHROMIUM_ENDPOINT = process.env.CHROMIUM_ENDPOINT ?? 'https://reinvest-chromium-upload-bucket.s3.amazonaws.com/chromium-v114.0.0-pack.tar';

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

export const DEALPATH_CONFIG = {
  API_URL: process.env.DEALPATH_API_URL as string,
  AUTHORIZATION_TOKEN: process.env.DEALPATH_AUTHORIZATION_TOKEN as string,
  VERSION_HEADER: process.env.DEALPATH_VERSION_HEADER as string,
};

export const WEB_APP_URL = process.env.WEB_APP_URL?.replace(/\/*$/, '') as string;

export const DATABASE_CONFIG = {
  host: process.env.POSTGRESQL_HOST as string,
  user: process.env.POSTGRESQL_USER as string,
  password: process.env.POSTGRESQL_PASSWORD as string,
  database: process.env.POSTGRESQL_DB as string,
};

export const S3_CONFIG = {
  region: process.env.INFRASTRUCTURE_AWS_REGION as string,
  avatarsBucket: process.env.S3_BUCKET_AVATARS as string,
  documentsBucket: process.env.S3_BUCKET_DOCUMENTS as string,
  portfolioBucket: process.env.S3_BUCKET_PORTFOLIO as string,
};

export const COGNITO_CONFIG = {
  region: process.env.INFRASTRUCTURE_AWS_REGION as string,
  userPoolID: process.env.CognitoUserPoolID as string,
  localClientId: process.env.LocalCognitoClientId as string,
  isLocal: process.env.IT_IS_LOCAL === 'true',
};

export const SNS_CONFIG = {
  region: process.env.INFRASTRUCTURE_AWS_REGION as string,
  originationNumber: process.env.SNS_ORIGINATION_NUMBER as string,
};
export const SQS_CONFIG = {
  region: process.env.INFRASTRUCTURE_AWS_REGION as string,
  queueUrl: process.env.SQS_QUEUE_URL as string,
  isLocal: process.env.IT_IS_LOCAL === 'true',
};
export const PDF_GENERATOR_SQS_CONFIG = {
  region: process.env.INFRASTRUCTURE_AWS_REGION as string,
  queueUrl: process.env.SQS_PDF_GENERATOR_URL as string,
  isLocal: process.env.IT_IS_LOCAL === 'true',
};

export const FIREBASE_SQS_CONFIG = {
  region: process.env.INFRASTRUCTURE_AWS_REGION as string,
  queueUrl: process.env.SQS_FIREBASE_QUEUE_URL as string,
  isLocal: process.env.IT_IS_LOCAL === 'true',
};

export const SEGMENT_SQS_CONFIG = {
  region: process.env.INFRASTRUCTURE_AWS_REGION as string,
  queueUrl: process.env.SQS_SEGMENT_QUEUE_URL as string,
  isLocal: process.env.IT_IS_LOCAL === 'true',
};

export const LAMBDA_CONFIG = {
  region: process.env.INFRASTRUCTURE_AWS_REGION as string,
  isLocal: process.env.IT_IS_LOCAL === 'true',
};

export const SENTRY_CONFIG = {
  dsn: process.env.SENTRY_DSN as string,
  environment: process.env.ENVIRONMENT_STAGE as string,
  isLocal: process.env.IT_IS_LOCAL === 'true',
};

export const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN as string;

export const EMAIL_CONFIG = {
  sourceEmail: process.env.EMAIL_SEND_FROM as string,
  replyToEmail: process.env.EMAIL_REPLY_TO as string,
  region: process.env.INFRASTRUCTURE_AWS_REGION as string,
};
// export const FIREBASE_SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON as string;
export const SEGMENT_API_KEY = process.env.SEGMENT_API_KEY as string;
