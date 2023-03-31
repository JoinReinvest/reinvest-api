import { ContainerInterface } from 'Container/Container';
import { AccountManagementController } from 'InvestmentAccounts/Infrastructure/Ports/Controller/AccountManagementController';
import { CreateProfileController } from 'InvestmentAccounts/Infrastructure/Ports/Controller/CreateProfileController';

export type InvestmentAccountsApiType = {
  createProfile: CreateProfileController['execute'];
  listAccountTypesUserCanOpen: AccountManagementController['listAccountTypesUserCanOpen'];
  openAccount: AccountManagementController['openAccount'];
};

export const investmentAccountsApi = (container: ContainerInterface): InvestmentAccountsApiType => ({
  createProfile: container.delegateTo(CreateProfileController, 'execute'),
  openAccount: container.delegateTo(AccountManagementController, 'openAccount'),
  listAccountTypesUserCanOpen: container.delegateTo(AccountManagementController, 'listAccountTypesUserCanOpen'),
});
