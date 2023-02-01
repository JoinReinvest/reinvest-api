import serverless from "serverless-http";

const express = require('express');
import {AttributeType, CognitoIdentityProviderClient, SignUpCommand} from "@aws-sdk/client-cognito-identity-provider";


const app = express();

app.post('/local-sign-up', async function (req: any, res: any) {
    const email = "lukaszX@devkick.pl";
    const response = {status: "ok", result: null};
    const client = new CognitoIdentityProviderClient({region: "eu-west-2"});

    const topt = !!req.apiGateway.event.queryStringParameters.topt ? req.apiGateway.event.queryStringParameters.topt : null;
    if (topt) {

    } else {
        const setPhoneNumberCommand = new SignUpCommand({
            Username: email,
            ClientId: process.env.CognitoPostmanClientId as string,
            Password: "phpSUCK123",
            UserAttributes: [
                {
                    Name: 'custom:incentive_token',
                    Value: "this-is-custom-token-X"
                } as AttributeType
            ]
        });

        response["result"] = await client.send(setPhoneNumberCommand);

    }

    res.json(response);
})

export const main = serverless(app);
