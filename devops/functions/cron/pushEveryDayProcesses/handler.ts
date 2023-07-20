import { selfInvoker } from 'devops/functions/cron/selfInvoker';
import { UUID } from 'HKEKTypes/Generics';
import { Investments } from 'Investments/index';
import { Portfolio } from 'Portfolio/index';
import { boot } from 'Reinvest/bootstrap';
import { SharesAndDividends } from 'SharesAndDividends/index';

export const main = async (event: any, context: any, callback: (...rest: any[]) => any) => {
  if (event?.command === 'push-transaction') {
    await processPushTransaction(event.investmentId);
    callback(null, event);

    return;
  }

  if (event?.command === 'auto-reinvestment') {
    await processAutoReinvest(event.profileId, event.accountId, event.portfolioId, event.dividendId);
    callback(null, event);

    return;
  }

  if (event?.command === 'invoke-push-transaction') {
    await invokePushTransaction(context.functionName, event.page);
    callback(null, event);

    return;
  }

  await invokePushTransaction(context.functionName, 0);
  await invokeDividendReinvestment(context.functionName);
  callback(null, event);
};

async function processPushTransaction(investmentId: UUID) {
  const modules = boot();
  const investmentApi = modules.getApi<Investments.ApiType>(Investments);
  await investmentApi.pushTransaction(investmentId);

  await modules.close();
}

async function processAutoReinvest(profileId: UUID, accountId: UUID, portfolioId: UUID, dividendId: UUID) {
  const modules = boot();
  const api = modules.getApi<Investments.ApiType>(Investments);
  await api.reinvestDividends(profileId, accountId, portfolioId, [dividendId]);

  await modules.close();
}

async function invokePushTransaction(functionName: string, page: number) {
  const modules = boot();
  const api = modules.getApi<Investments.ApiType>(Investments);
  const investments = await api.getPendingInvestments({ page: page, perPage: 30 });

  if (!investments) {
    await modules.close();

    return;
  }

  const invoker = selfInvoker(functionName);

  for (const investmentId of investments) {
    console.log(`Invoking push transaction for investment ${investmentId}`);
    await invoker({ investmentId, command: 'push-transaction' });
  }

  await invoker({ command: 'invoke-push-transaction', page: page + 1 });

  await modules.close();
}

async function invokeDividendReinvestment(functionName: string) {
  const modules = boot();
  const portfolioApi = modules.getApi<Portfolio.ApiType>(Portfolio);
  const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);
  const dividends = await api.getDividendsReadyForAutomaticReinvestment();

  if (dividends.length === 0) {
    await modules.close();

    return;
  }

  const { portfolioId } = await portfolioApi.getActivePortfolio();
  const invoker = selfInvoker(functionName);

  for (const dividend of dividends) {
    console.log(`Invoking auto reinvestment for investment ${dividend.dividendId}`);
    await invoker({
      command: 'auto-reinvestment',
      portfolioId,
      dividendId: dividend.dividendId,
      profileId: dividend.profileId,
      accountId: dividend.accountId,
    });
  }

  await modules.close();
}
