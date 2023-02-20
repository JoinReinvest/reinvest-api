import {migrate} from "Reinvest/migration";

const response = require('cfn-response');

export const main = async (event: any, context: any) => {
    try {
        console.log('Starting migration');
        await migrate('migrateLatest')
        console.log('Migration finished!');
    } catch (error: any) {
        console.log({error});
    } finally {
        if (event.ResponseURL) { // called by cloudformation
            response.send(event, context, response.SUCCESS, {status: true});
        }
    }
};
