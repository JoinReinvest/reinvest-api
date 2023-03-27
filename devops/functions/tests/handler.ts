// @ts-nocheck
import serverless from "serverless-http";
import {
    DATABASE_CONFIG,
    SQS_CONFIG,
    COGNITO_CONFIG
} from "Reinvest/config";
import {DatabaseProvider, PostgreSQLConfig} from "shared/hkek-postgresql/DatabaseProvider";
import {IdentityDatabase} from "Reinvest/Identity/src/Adapter/Database/IdentityDatabaseAdapter";
import {LegalEntitiesDatabase} from "Reinvest/LegalEntities/src/Adapter/Database/DatabaseAdapter";
import {InvestmentAccountsDatabase} from "Reinvest/InvestmentAccounts/src/Infrastructure/Storage/DatabaseAdapter";
import {QueueSender} from "shared/hkek-sqs/QueueSender";
import {
    AdminCreateUserCommand, AdminDeleteUserCommand, AdminSetUserPasswordCommand, ChangePasswordCommand,
    CognitoIdentityProviderClient, InitiateAuthCommand, ListUsersCommand
} from "@aws-sdk/client-cognito-identity-provider";
import {main as postSignUp} from "../postSignUp/handler";

const express = require('express');
const bodyParser = require('body-parser');

// dependencies
type AllDatabases = IdentityDatabase & LegalEntitiesDatabase & InvestmentAccountsDatabase;
const databaseProvider = new DatabaseProvider<AllDatabases>(DATABASE_CONFIG as PostgreSQLConfig);

const queueSender = new QueueSender(SQS_CONFIG);

async function sendMessage(kind: string, id: string, data: any): Promise<void> {
    const message = {kind, id, data};
    await queueSender.send(JSON.stringify(message));
}

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
const router = express.Router();

router.post("/event/account-opened", async (req: any, res: any) => {
    console.log("account-opened");
    res.status(200).send("OK");
});

router.post("/get-sms-topt", async (req: any, res: any) => {
    try {
        const {phoneNumber} = req.body;
        const data = await databaseProvider.provide()
            .selectFrom("identity_phone_verification")
            .select(['topt'])
            .where('phoneNumber', '=', phoneNumber)
            .limit(1)
            .executeTakeFirstOrThrow();

        res.status(200).json({
            topt: data.topt,
            status: true
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: false
        });
    }
});

router.post("/events", async (req: any, res: any) => {
    try {
        const {kind, id} = req.body;
        switch (kind) {
            case "LegalProfileCompleted":
                await sendMessage(kind, id, {});
                break;
            case "IndividualAccountOpened":
                const {individualAccountId} = req.body;
                await sendMessage(kind, id, {individualAccountId});
                break;
            default:
                throw new Error("Unknown event");
        }

        res.status(200).json({
            status: true
        });
    } catch (e: any) {
        console.log(e);
        res.status(500).json({
            status: false,
            message: e.message,
        });
    }
});

const password = "ThisTestUserPassword123!";
const getUserEmail = (userNumber: number) => `reinvest-test-user-${userNumber}@devkick.pl`;

router.post("/user/create-and-login", async (req: any, res: any) => {
    try {
        const {userNumber, referralCode} = req.body;
        const incentiveToken = referralCode ? referralCode : '';
        const client = new CognitoIdentityProviderClient({region: COGNITO_CONFIG.region});

        const email = getUserEmail(userNumber);

        const userAttributes = [
            {
                Name: "email",
                Value: email,
            },
            {
                Name: "email_verified",
                Value: "true"
            },
            {
                Name: 'custom:incentive_token',
                Value: incentiveToken,
            },

        ];

        const createUserCommand = new AdminCreateUserCommand({
            UserPoolId: COGNITO_CONFIG.userPoolID,
            Username: email,
            DesiredDeliveryMediums: ["EMAIL"],
            TemporaryPassword: "thisIsATemporaryPassword123!ImustProvide",
            UserAttributes: userAttributes,
        });
        const createUserResult = await client.send(createUserCommand);

        if (COGNITO_CONFIG.isLocal) {
            await postSignUp({
                request: {
                    userAttributes: {
                        sub: createUserResult.User.Username,
                        email_verified: true,
                        email,
                        'custom:incentive_token': incentiveToken,
                    }
                }
            }, {}, (message) => {
                console.log(`postSignUp: ${message}`);
            })
        }

        const changePasswordCommand = new AdminSetUserPasswordCommand({
            Password: password,
            Permanent: true,
            Username: createUserResult.User.Username,
            UserPoolId: COGNITO_CONFIG.userPoolID,
        });
        const changePasswordResult = await client.send(changePasswordCommand);

        const SignInCommand = new InitiateAuthCommand({
            ClientId: COGNITO_CONFIG.localClientId,
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        });
        const signInResult = await client.send(SignInCommand);

        res.status(200).json({
            status: true,
            createUserResult,
            changePasswordResult,
            signInResult,
        });
    } catch (e: any) {
        console.log(e);
        res.status(500).json({
            status: false,
            message: e.message,
        });
    }
});
router.post("/user/login", async (req: any, res: any) => {
    try {
        const {userNumber} = req.body;

        const client = new CognitoIdentityProviderClient({region: COGNITO_CONFIG.region});
        const email = getUserEmail(userNumber);

        const SignInCommand = new InitiateAuthCommand({
            ClientId: COGNITO_CONFIG.localClientId,
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        });
        const signInResult = await client.send(SignInCommand);

        res.status(200).json({
            status: true,
            signInResult,
        });
    } catch (e: any) {
        console.log(e);
        res.status(500).json({
            status: false,
            message: e.message,
        });
    }
});

router.post("/user/remove", async (req: any, res: any) => {
    try {
        const {userNumber} = req.body;

        const client = new CognitoIdentityProviderClient({region: COGNITO_CONFIG.region});
        const email = getUserEmail(userNumber);

        const listUsersCommand = new ListUsersCommand({
            UserPoolId: COGNITO_CONFIG.userPoolID,
            AttributesToGet: ["sub"],
            Limit: 1,
            Filter: `email = "${email}"`,
        });

        const findUserResult = await client.send(listUsersCommand);
        const sub = findUserResult?.Users[0]?.Attributes[0]?.Value;
        if (!sub) {
            throw new Error('User not found');
        }
        let removeFromDatabaseStatus = true;
        try {
            const {profileId} = await databaseProvider.provide()
                .selectFrom("identity_user")
                .select(['profileId'])
                .where('cognitoUserId', '=', sub)
                .limit(1)
                .executeTakeFirstOrThrow();

            const removeItemsByProfile = {
                legal_entities_draft_accounts: 'profileId',
                legal_entities_individual_account: 'profileId',
                legal_entities_profile: 'profileId',
                investment_accounts_profile_aggregate: 'aggregateId',
                identity_user: 'profileId',
            }

            for (const [table, column] of Object.entries(removeItemsByProfile)) {
                await databaseProvider.provide()
                    .deleteFrom(table)
                    .where(column, '=', profileId)
                    .execute()
                ;
            }

        } catch (e) {
            console.log('User not found in database');
            removeFromDatabaseStatus = false
        }

        const removeUserCommand = new AdminDeleteUserCommand({
            UserPoolId: COGNITO_CONFIG.userPoolID,
            Username: sub,
        });
        const removeUserResult = await client.send(removeUserCommand);

        res.status(200).json({
            status: true,
            removeUserResult,
            findUserResult,
            removeFromDatabaseStatus,
            sub,
        });
    } catch (e: any) {
        console.log(e);
        res.status(500).json({
            status: false,
            message: e.message,
        });
    }
});

app.use("/tests", router);
export const main = serverless(app);
