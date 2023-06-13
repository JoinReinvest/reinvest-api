import { Registration } from 'Registration/index';
import { boot } from 'Reinvest/bootstrap';

import { selfInvoker } from '../selfInvoker';

export const main = async (event: any, context: any, callback: (...rest: any[]) => any) => {
  if (event.syncId) {
    //github.com/JoinReinvest/reinvest-api/pull/42
    await synchronizeObject(event.syncId);
  } else {
    await invokeSynchronization(context.functionName);
  }

  callback(null, event);
};

async function synchronizeObject(id: string) {
  console.log(`[START] Syncing object ${id}`);
  const modules = boot();
  const registrationApi = modules.getApi<Registration.ApiType>(Registration);
  const vendorsSynchronizationStatus = await registrationApi.synchronize(id);
  await modules.close();
  console.log(`[END] Syncing object ${id} - ${vendorsSynchronizationStatus}`);
}

async function invokeSynchronization(functionName: string) {
  const modules = boot();

  const registrationApi = modules.getApi<Registration.ApiType>(Registration);
  const objectIds = await registrationApi.listObjectsToSync();
  await modules.close();

  if (objectIds.length === 0) {
    return;
  }

  const invoker = selfInvoker(functionName);

  for (const id of objectIds) {
    await invoker({ syncId: id });
  }
}
