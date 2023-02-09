import serverless from "serverless-http";

const express = require('express');
import {
    AttributeType,
    CognitoIdentityProviderClient,
    ConfirmSignUpCommand,
    SignUpCommand
} from "@aws-sdk/client-cognito-identity-provider";


const app = express();

app.post('/local-sign-up', async function (req: any, res: any) {
    const email = "lukaszX@devkick.pl";
    const response = {status: "ok", result: null};
    const client = new CognitoIdentityProviderClient({region: "us-east-1"});

    const {apiGateway: {event: {queryStringParameters}}} = req;

    if (queryStringParameters && queryStringParameters.topt && queryStringParameters.userId) {
        const {topt, userId} = queryStringParameters;
        const confirmSignUpCommand = new ConfirmSignUpCommand({
            ClientId: process.env.CognitoPostmanClientId as string,
            Username: userId,
            ConfirmationCode: topt,
        });

        try {
            response["result"] = await client.send(confirmSignUpCommand);
        } catch (error: any) {
            response.status = "failed";
            response["result"] = error.message;
        }
    } else {
        const signUpCommand = new SignUpCommand({
            Username: email,
            ClientId: process.env.CognitoPostmanClientId as string,
            Password: "thisIsTestPassword123",
            UserAttributes: [
                {
                    Name: 'custom:incentive_token',
                    Value: "123456"
                } as AttributeType
            ]
        });
        try {
            response["result"] = await client.send(signUpCommand);
        } catch (error: any) {
            response.status = "failed";
            response["result"] = error.message;
        }
    }

    res.json(response);
})

export const main = serverless(app);
