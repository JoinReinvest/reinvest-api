import { Registration } from 'Registration/index';
import { boot } from 'Reinvest/bootstrap';

import { selfInvoker } from '../selfInvoker';

export const main = async (event: any, context: any, callback: (...rest: any[]) => any) => {
  if (event.syncDocumentId) {
    await synchronizeDocument(event.syncDocumentId);
  } else {
    await invokeSynchronization(context.functionName);
  }

  callback(null, event);
};

async function synchronizeDocument(documentId: string) {
  console.log(`[START] Syncing document with North Capital ${documentId}`);
  const modules = boot();
  const registrationApi = modules.getApi<Registration.ApiType>(Registration);
  const documentSynchronizationStatus = await registrationApi.synchronizeDocument(documentId);
  await modules.close();
  console.log(`[END] Syncing document with North Capital ${documentId} - ${documentSynchronizationStatus}`);
}

async function invokeSynchronization(functionName: string) {
  const modules = boot();

  const registrationApi = modules.getApi<Registration.ApiType>(Registration);
  const documentIds = await registrationApi.listDocumentsToSynchronize();
  await modules.close();

  if (documentIds.length === 0) {
    return;
  }

  const invoker = selfInvoker(functionName);

  for (const documentId of documentIds) {
    await invoker({ syncDocumentId: documentId });
  }
}
