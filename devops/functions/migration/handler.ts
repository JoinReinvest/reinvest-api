import {migrate} from "Reinvest/migration";

export const main = async () => {
    console.log('Starting migration');
    await migrate('migrateLatest')
    console.log('Migration finished!');
};
