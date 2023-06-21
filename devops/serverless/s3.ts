import { exportOutput, getAttribute, getResourceName, importOutput, joinAttributes } from './utils';

const importDocumentsArn = () => importOutput('DocumentsBucketArn');
const importAvatarsArn = () => importOutput('AvatarsBucketArn');
const importPortfolioArn = () => importOutput('PortfolioBucketArn');

export const S3PoliciesWithImport = [
  {
    Effect: 'Allow',
    Action: ['s3:*'],
    Resource: [
      joinAttributes('/', [importDocumentsArn(), '*']),
      joinAttributes('/', [importAvatarsArn(), '*']),
      joinAttributes('/', [importPortfolioArn(), '*']),
    ],
  },
];

const BucketEncryption = {
  BucketEncryption: {
    ServerSideEncryptionConfiguration: [
      {
        ServerSideEncryptionByDefault: {
          SSEAlgorithm: 'AES256',
        },
      },
    ],
  },
};

const CorsConfiguration = {
  CorsConfiguration: {
    CorsRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'PUT', 'HEAD'],
        AllowedOrigins: ['*'],
      },
    ],
  },
};

export const S3Resources = {
  BucketDocuments: {
    Type: 'AWS::S3::Bucket',
    DeletionPolicy: 'Delete', // TODO change later to Retain!
    Properties: {
      BucketName: getResourceName('documents'),
      AccessControl: 'Private',
      ...BucketEncryption,
      ...CorsConfiguration,
    },
  },
  BucketAvatars: {
    Type: 'AWS::S3::Bucket',
    DeletionPolicy: 'Delete', // TODO change later to Retain!
    Properties: {
      BucketName: getResourceName('avatars'),
      AccessControl: 'Private',
      ...BucketEncryption,
      ...CorsConfiguration,
    },
  },
  BucketPortfolio: {
    Type: 'AWS::S3::Bucket',
    DeletionPolicy: 'Delete', // TODO change later to Retain!
    Properties: {
      BucketName: getResourceName('portfolio'),
      AccessControl: 'Private',
      ...CorsConfiguration,
    },
  },
};

export const S3Outputs = {
  DocumentsBucketArn: {
    Value: getAttribute('BucketDocuments', 'Arn'),
    Description: 'Documents bucket Arn',
    ...exportOutput('DocumentsBucketArn'),
  },
  AvatarsBucketArn: {
    Value: getAttribute('BucketAvatars', 'Arn'),
    Description: 'Avatars bucket Arn',
    ...exportOutput('AvatarsBucketArn'),
  },
  DocumentsBucketName: {
    Value: getResourceName('documents'),
    Description: 'Documents bucket name',
    ...exportOutput('DocumentsBucketName'),
  },
  AvatarsBucketName: {
    Value: getResourceName('avatars'),
    Description: 'Avatars bucket name',
    ...exportOutput('AvatarsBucketName'),
  },
  PortfolioBucketArn: {
    Value: getAttribute('BucketPortfolio', 'Arn'),
    Description: 'Portfolio bucket Arn',
    ...exportOutput('PortfolioBucketArn'),
  },
};
