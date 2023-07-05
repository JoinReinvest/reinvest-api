import { selfInvoker } from 'devops/functions/cron/selfInvoker';
import { UUID } from 'HKEKTypes/Generics';
import { Investments } from 'Investments/index';
import { boot } from 'Reinvest/bootstrap';

export const main = async (event: any, context: any, callback: (...rest: any[]) => any) => {
  if (event?.command === 'push-transaction') {
    await processPushTransaction(event.investmentId);

    callback(null, event);

    return;
  }

  await invokePushTransaction(context.functionName);
  callback(null, event);
};

async function processPushTransaction(investmentId: UUID) {
  const modules = boot();
  const investmentApi = modules.getApi<Investments.ApiType>(Investments);
  await investmentApi.pushTransaction(investmentId);

  await modules.close();
}

async function invokePushTransaction(functionName: string) {
  const modules = boot();
  const api = modules.getApi<Investments.ApiType>(Investments);
  const investments = await api.getPendingInvestments();

  if (!investments) {
    await modules.close();

    return;
  }

  const invoker = selfInvoker(functionName);

  for (const investmentId of investments) {
    console.log(`Invoking push transaction for investment ${investmentId}`);
    await invoker({ investmentId, command: 'push-transaction' });
  }

  await modules.close();
}
