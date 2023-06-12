import { selfInvoker } from 'devops/functions/cron/selfInvoker';
import { UUID } from 'HKEKTypes/Generics';
import { boot } from 'Reinvest/bootstrap';
import { SharesAndDividends } from 'SharesAndDividends/index';

export const main = async (event: any, context: any, callback: (...rest: any[]) => any) => {
  if (event.distributionId && event.accountIds.length > 0) {
    await distributeDividends(event.distributionId, event.accountIds);
  } else {
    await invokeDistribution(context.functionName);
  }

  callback(null, event);
};

async function distributeDividends(distributionId: UUID, accountIds: UUID[]) {
  console.log(`[START] Distributing dividends for distribution ${distributionId}...`);
  const modules = boot();
  const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);

  await api.distributeDividends(distributionId, accountIds);

  await modules.close();
  console.log(`[FINISHED] Distributing dividends for distribution ${distributionId}`);
}

async function invokeDistribution(functionName: string) {
  const modules = boot();
  const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);
  const accountIdsToDistributeDividends = await api.getAccountsForDividendDistribution();

  if (!accountIdsToDistributeDividends) {
    await modules.close();

    return;
  }

  console.log('Invoking shares distribution');

  const { distributionId, accountIds } = accountIdsToDistributeDividends;

  if (accountIds.length === 0) {
    await api.distributionsCompleted(distributionId);
    await modules.close();

    return;
  }

  const invoker = selfInvoker(functionName);
  do {
    const accountsIdsBatch = accountIds.splice(0, 200);
    const accountIdsToDistributeDividendsBatch = { distributionId, accountIds: accountsIdsBatch };

    await invoker(accountIdsToDistributeDividendsBatch);
  } while (accountIds.length > 0);
  await modules.close();
}
