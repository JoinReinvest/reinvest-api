import {migrate} from "../../Reinvest/migration";

const [_, __, command] = process.argv;

migrate(command as 'migrateLatest' | 'migrateUp' | 'migrateDown');
