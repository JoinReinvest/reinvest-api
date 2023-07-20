import { selfInvoker } from 'devops/functions/cron/selfInvoker';
import { UUID } from 'HKEKTypes/Generics';
import { Investments } from 'Investments/index';
import { LegalEntities } from 'LegalEntities/index';
import { Registration } from 'Registration/index';
import { boot } from 'Reinvest/bootstrap';

export const main = async (event: any, context: any, callback: (...rest: any[]) => any) => {
  if (event?.command === 'create-investment') {
    await createInvestment(event.recurringInvestmentId, event.profileId, event.accountId);

    callback(null, event);

    return;
  }

  await invokeRecurringInvestments(context.functionName);
  callback(null, event);
};

async function createInvestment(recurringInvestmentId: UUID, profileId: UUID, accountId: UUID) {
  const modules = boot();
  const investmentApi = modules.getApi<Investments.ApiType>(Investments);
  const legalEntitiesApi = modules.getApi<LegalEntities.ApiType>(LegalEntities);
  const registrationApi = modules.getApi<Registration.ApiType>(Registration);

  const parentId = await legalEntitiesApi.mapAccountIdToParentAccountIdIfRequired(profileId, accountId);
  const bankAccountData = await registrationApi.readBankAccount(profileId, parentId);

  if (!bankAccountData?.bankAccountId) {
    console.error(`Cannot create investment for recurring investment ${recurringInvestmentId}. Bank account not found.`);

    return;
  }

  const bankAccountId = bankAccountData.bankAccountId;
  await investmentApi.createInvestmentFromRecurringInvestment(recurringInvestmentId, bankAccountId, parentId === accountId ? null : parentId);

  await modules.close();
}

async function invokeRecurringInvestments(functionName: string) {
  const modules = boot();
  const api = modules.getApi<Investments.ApiType>(Investments);
  let page = 0;
  const perPage = 10;
  let recurringInvestments = [];
  const invoker = selfInvoker(functionName);

  do {
    recurringInvestments = await api.getRecurringInvestmentsToCreate({ page, perPage });

    for (const recurringInvestment of recurringInvestments) {
      console.log(`Creating investment from recurring investment: ${recurringInvestment.id}`);
      await invoker({
        recurringInvestmentId: recurringInvestment.id,
        profileId: recurringInvestment.profileId,
        accountId: recurringInvestment.accountId,
        command: 'create-investment',
      });
    }

    page++;
  } while (recurringInvestments.length > 0);

  await modules.close();

  return;
}
