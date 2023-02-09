import {exportOutput, getAttribute, getResourceName, importOutput, joinAttributes} from "./utils";

const getDocumentsArn = () => getAttribute("BucketDocuments", "Arn");
const getAvatarsArn = () => getAttribute("BucketAvatars", "Arn");
const getPortfolioArn = () => getAttribute("BucketPortfolio", "Arn");

const importDocumentsArn = () => importOutput("DocumentsBucketArn");
const importAvatarsArn = () => importOutput("AvatarsBucketArn");
const importPortfolioArn = () => importOutput("PortfolioBucketArn");

export const S3PoliciesWithImport = [
    {
        Effect: "Allow",
        Action: [
            "s3:PutObject",
            "s3:GetObject",
            "s3:DeleteObject",
            "s3:ListBucket",
        ],
        Resource: joinAttributes("/", [importDocumentsArn(), "*"]),
    },
    {
        Effect: "Allow",
        Action: [
            "s3:PutObject",
            "s3:GetObject",
            "s3:DeleteObject",
            "s3:ListBucket",
        ],
        Resource: joinAttributes("/", [importAvatarsArn(), "*"]),
    },
    {
        Effect: "Allow",
        Action: [
            "s3:PutObject",
            "s3:GetObject",
            "s3:DeleteObject",
            "s3:ListBucket",
            "s3:PutObjectAcl",
        ],
        Resource: joinAttributes("/", [importPortfolioArn(), "*"]),
    },
];

const BucketEncryption = {
    BucketEncryption: {
        ServerSideEncryptionConfiguration: [
            {
                ServerSideEncryptionByDefault: {
                    SSEAlgorithm: "AES256",
                },
            },
        ],
    },
};

const CorsConfiguration = {
    CorsConfiguration: {
        CorsRules: [
            {
                AllowedHeaders: ["*"],
                AllowedMethods: ["GET", "HEAD"],
                AllowedOrigins: ["*"],
            },
        ],
    },
};

export const S3Resources = {
    BucketDocuments: {
        Type: "AWS::S3::Bucket",
        DeletionPolicy: "Delete", // TODO change later to Retain!
        Properties: {
            BucketName: getResourceName("documents"),
            AccessControl: "Private",
            ...BucketEncryption,
            ...CorsConfiguration,
        },
    },
    BucketAvatars: {
        Type: "AWS::S3::Bucket",
        DeletionPolicy: "Delete", // TODO change later to Retain!
        Properties: {
            BucketName: getResourceName("avatars"),
            AccessControl: "Private",
            ...BucketEncryption,
            ...CorsConfiguration,
        },
    },
    BucketPortfolio: {
        Type: "AWS::S3::Bucket",
        DeletionPolicy: "Delete", // TODO change later to Retain!
        Properties: {
            BucketName: getResourceName("portfolio"),
            AccessControl: "PublicRead",
            ...CorsConfiguration,
        },
    },
};

export const S3Outputs = {
    DocumentsBucketArn: {
        Value: getAttribute("BucketDocuments", "Arn"),
        Description: "Documents bucket Arn",
        ...exportOutput('DocumentsBucketArn')
    },
    AvatarsBucketArn: {
        Value: getAttribute("BucketAvatars", "Arn"),
        Description: "Avatars bucket Arn",
        ...exportOutput('AvatarsBucketArn')
    },
    PortfolioBucketArn: {
        Value: getAttribute("BucketPortfolio", "Arn"),
        Description: "Portfolio bucket Arn",
        ...exportOutput('PortfolioBucketArn')
    },
}
