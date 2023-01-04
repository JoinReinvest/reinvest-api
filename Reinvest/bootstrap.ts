import { InvestmentAccounts } from "Reinvest/InvestmentAccounts";
import { Investments } from "Reinvest/Investments/src/bootstrap";
import Modules from "Reinvest/Modules";

export function boot(): Modules {
  const modules = new Modules();
  Investments.boot({
    database: {
      connectionString: "connection-string-test",
    },
  } as Investments.Config);

  modules.register(
    InvestmentAccounts.moduleName,
    InvestmentAccounts.create({
      database: {
        connectionString: "connection-string-test",
      },
    } as InvestmentAccounts.Config)
  );

  //postgres://executive:password@localhost/lukaszd_staging_db

  console.log("App bootstrapped");

  return modules;
}
