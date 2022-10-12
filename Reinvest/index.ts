import {Investments} from "./Investments/src/bootstrap";

Investments.boot({
    database: {
        connectionString: "connection-string-test"
    }
} as Investments.Config)
