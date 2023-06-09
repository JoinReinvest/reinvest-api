import { Registration } from 'Registration/index';
import { boot } from 'Reinvest/bootstrap';
import { SharesAndDividends } from 'SharesAndDividends/index';

export const main = async (event: any, context: any, callback: (...rest: any[]) => any) => {
  if (event.sharesIds && event.sharesIds.length > 0) {
    await calculateShares(event.syncDocumentId);
  } else {
    await invokeSynchronization(context.functionName);
  }

  callback(null, event);
};

async function calculateShares(documentId: string) {
  console.log(`[START] Syncing document with North Capital ${documentId}`);
  const modules = boot();
  const registrationApi = modules.getApi<Registration.ApiType>(Registration);
  const dividendsCalculationhronizationStatus = await registrationApi.synchronizeDocument(documentId);
  await modules.close();
  console.log(`[END] Syncing document with North Capital ${documentId} - ${dividendsCalculationhronizationStatus}`);
}

async function invokeSynchronization(functionName: string) {
  const modules = boot();
  console.log('Invoking shares calculation');
  const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);
  // const sharesToCalculate = await api.getNextSharesToCalculate();
  await modules.close();
  //
  // if (sharesToCalculate.length === 0) {
  //   await api.calculationsCompleted();
  //
  //   return;
  // }
  //
  // const invoker = selfInvoker(functionName);
  //
  // await invoker({ sharesIds: sharesToCalculate });
}
