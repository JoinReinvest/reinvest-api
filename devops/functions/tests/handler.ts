import serverless from "serverless-http";
import {
    DATABASE_CONFIG,
    SQS_CONFIG,
} from "Reinvest/config";
import {DatabaseProvider, PostgreSQLConfig} from "shared/hkek-postgresql/DatabaseProvider";
import {IdentityDatabase} from "Reinvest/Identity/src/Adapter/Database/IdentityDatabaseAdapter";
import {LegalEntitiesDatabase} from "Reinvest/LegalEntities/src/Adapter/Database/DatabaseAdapter";
import {InvestmentAccountsDatabase} from "Reinvest/InvestmentAccounts/src/Infrastructure/Storage/DatabaseAdapter";
import {QueueSender} from "shared/hkek-sqs/QueueSender";

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


app.use("/tests", router);
export const main = serverless(app);
