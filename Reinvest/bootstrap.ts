import {Investments} from "Investments/src/bootstrap"

export const boot = () => {
    Investments.boot({
        database: {
            connectionString: "connection-string-test"
        }
    } as Investments.Config);


//postgres://executive:password@localhost/lukaszd_staging_db


    console.log('App bootstrapped');
}

