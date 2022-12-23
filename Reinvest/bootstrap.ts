import {Investments} from "Investments/src/bootstrap"
// import EventStore from "node-eventstore-postgre"

export const boot = () => {
    Investments.boot({
        database: {
            connectionString: "connection-string-test"
        }
    } as Investments.Config);



    // const eventStore = new EventStore('postgres://executive:password@localhost/lukaszd_staging_db');
    // eventStore.init()

    console.log('App bootstrapped');
}

