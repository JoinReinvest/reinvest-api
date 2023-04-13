export const ProviderConfiguration = {
    name: "aws",
    runtime: "nodejs18.x",
    region: "us-east-1",
}

export const ProviderEnvironment = {
    AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    SERVERLESS_SERVICE: "reinvest",
    SERVERLESS_ACCOUNT_ID: "${aws:accountId}",
    SERVERLESS_REGION: "${aws:region}"
}

export const margeWithApiGatewayUrl = (query: string = "") => ({
    "Fn::Sub": [
        "https://${ApiGatewayRestApi}.execute-api.${aws:region}.amazonaws.com" + query,
        {
            ApiGatewayRestApi: {Ref: "HttpApi"}
        }
    ]
})