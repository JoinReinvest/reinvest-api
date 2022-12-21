import {Investments} from "Investments/src/bootstrap"

export const boot = () => {
    Investments.boot({
        database: {
            connectionString: "connection-string-test"
        }
    } as Investments.Config);

    console.log('App bootstrapped');
}