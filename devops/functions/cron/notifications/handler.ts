import { selfInvoker } from 'devops/functions/cron/selfInvoker';
import { UUID } from 'HKEKTypes/Generics';
import { Notifications } from 'Notifications/index';
import { boot } from 'Reinvest/bootstrap';

export const main = async (event: any, context: any, callback: (...rest: any[]) => any) => {
  if (event.storedEventId) {
    await processNotifications(event.storedEventId);
  } else {
    await invokeNotifications(context.functionName);
  }

  callback(null, event);
};

async function processNotifications(storedEventId: UUID) {
  const modules = boot();
  const api = modules.getApi<Notifications.ApiType>(Notifications);

  await api.processStoredEvent(storedEventId);

  await modules.close();
}

async function invokeNotifications(functionName: string) {
  const modules = boot();
  const api = modules.getApi<Notifications.ApiType>(Notifications);
  const storedEvents = await api.listStoredEventsIds();

  if (!storedEvents) {
    await modules.close();

    return;
  }

  console.log('Invoking notifications');

  const invoker = selfInvoker(functionName);

  for (const storedEventId of storedEvents) {
    await invoker({ storedEventId });
  }

  await modules.close();
}
