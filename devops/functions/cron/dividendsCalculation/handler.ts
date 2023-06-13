import { selfInvoker } from 'devops/functions/cron/selfInvoker';
import { UUID } from 'HKEKTypes/Generics';
import { boot } from 'Reinvest/bootstrap';
import { SharesAndDividends } from 'SharesAndDividends/index';

type SharesToCalculate = {
  declarationId: UUID;
  sharesIds: UUID[];
};

export const main = async (event: any, context: any, callback: (...rest: any[]) => any) => {
  if (event.sharesIds && event.sharesIds.length > 0) {
    await calculateDividends({
      declarationId: event.declarationId,
      sharesIds: event.sharesIds,
    });
  } else {
    await invokeSynchronization(context.functionName);
  }

  callback(null, event);
};

async function calculateDividends(sharesToCalculate: SharesToCalculate) {
  console.log(`[START] Calculating shares for declaration ${sharesToCalculate.declarationId}...`);
  const modules = boot();
  const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);

  await api.calculateDividendsForShares(sharesToCalculate);

  await modules.close();
  console.log(`[FINISHED] Calculating shares for declaration ${sharesToCalculate.declarationId}`);
}

async function invokeSynchronization(functionName: string) {
  const modules = boot();
  const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);
  const sharesToCalculate = <SharesToCalculate | null>await api.getNextSharesToCalculate();

  if (!sharesToCalculate) {
    await modules.close();

    return;
  }

  console.log('Invoking shares calculation');

  if (sharesToCalculate.sharesIds.length === 0) {
    await api.calculationsCompleted(sharesToCalculate.declarationId);

    await modules.close();

    return;
  }

  const invoker = selfInvoker(functionName);
  const sharesIds = sharesToCalculate.sharesIds;
  const declarationId = sharesToCalculate.declarationId;
  do {
    const sharesIdsBatch = sharesIds.splice(0, 200);
    const sharesToCalculateBatch = { declarationId, sharesIds: sharesIdsBatch };

    await invoker(sharesToCalculateBatch);
  } while (sharesIds.length > 0);
  await modules.close();
}
