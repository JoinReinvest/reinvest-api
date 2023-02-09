export const ProviderConfiguration = {
    name: "aws",
    runtime: "nodejs16.x",
    region: "us-east-1",
}

export const ProviderEnvironment = {
    AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    SERVERLESS_SERVICE: "${self:service}",
    SERVERLESS_ACCOUNT_ID: "${aws:accountId}",
    SERVERLESS_STAGE: "${sls:stage}",
    SERVERLESS_REGION: "${aws:region}"
}