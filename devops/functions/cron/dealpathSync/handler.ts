import { Portfolio } from "Portfolio/index";
import { boot } from "Reinvest/bootstrap";

export const main = async (event: any, context: any, callback: (...rest: any[]) => any) => {
  const modules = boot();
  const portfolioApi = modules.getApi<Portfolio.ApiType>(Portfolio);
  const { portfolioId } = await portfolioApi.getActivePortfolio();
  console.log(`Synchronizing portfolio ${portfolioId}`);
  await portfolioApi.synchronizePortfolio(portfolioId);
  console.log(`Synchronizing Unit price for portfolio ${portfolioId}`);
  await portfolioApi.synchronizePortfolioUnitPrice(portfolioId);
  console.log(`Synchronization complete for portfolio ${portfolioId}`);
  await modules.close();
  callback(null, event);
};
