import { ContainerInterface } from 'Container/Container';
import { AccountManagementController } from 'InvestmentAccounts/Infrastructure/Ports/Controller/AccountManagementController';
import { ConfigurationController } from 'InvestmentAccounts/Infrastructure/Ports/Controller/ConfigurationController';
import { CreateProfileController } from 'InvestmentAccounts/Infrastructure/Ports/Controller/CreateProfileController';

export type InvestmentAccountsApiType = {
  createConfiguration: ConfigurationController['createConfiguration'];
  createProfile: CreateProfileController['execute'];
  getConfiguration: ConfigurationController['getConfiguration'];
  listAccountTypesUserCanOpen: AccountManagementController['listAccountTypesUserCanOpen'];
  openAccount: AccountManagementController['openAccount'];
  removeBeneficiary: AccountManagementController['removeBeneficiary'];
};

export const investmentAccountsApi = (container: ContainerInterface): InvestmentAccountsApiType => ({
  createProfile: container.delegateTo(CreateProfileController, 'execute'),
  createConfiguration: container.delegateTo(ConfigurationController, 'createConfiguration'),
  getConfiguration: container.delegateTo(ConfigurationController, 'getConfiguration'),
  openAccount: container.delegateTo(AccountManagementController, 'openAccount'),
  listAccountTypesUserCanOpen: container.delegateTo(AccountManagementController, 'listAccountTypesUserCanOpen'),
  removeBeneficiary: container.delegateTo(AccountManagementController, 'removeBeneficiary'),
});
