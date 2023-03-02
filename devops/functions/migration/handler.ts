import {migrate} from "Reinvest/migration";

export const main = async (event: any, context: any, callback: any) => {
    try {
        console.log('Starting migration');
        await migrate('migrateLatest')
        console.log('Migration finished!');
    } catch (error: any) {
        callback(error, event);
        console.log({error});
        return;
    }

    callback(null, event);
};
