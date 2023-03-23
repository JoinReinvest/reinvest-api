import serverless from "serverless-http";
import {
    DATABASE_CONFIG,
} from "Reinvest/config";
import {DatabaseProvider, PostgreSQLConfig} from "shared/hkek-postgresql/DatabaseProvider";
import {IdentityDatabase} from "Reinvest/Identity/src/Adapter/Database/IdentityDatabaseAdapter";
import {LegalEntitiesDatabase} from "Reinvest/LegalEntities/src/Adapter/Database/DatabaseAdapter";
import {InvestmentAccountsDatabase} from "Reinvest/InvestmentAccounts/src/Infrastructure/Storage/DatabaseAdapter";

const express = require('express');
const bodyParser = require('body-parser');

type AllDatabases = IdentityDatabase & LegalEntitiesDatabase & InvestmentAccountsDatabase;

const databaseProvider = new DatabaseProvider<AllDatabases>(DATABASE_CONFIG as PostgreSQLConfig);
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


app.use("/tests", router);
export const main = serverless(app);
