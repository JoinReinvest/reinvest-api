import {ContainerInterface} from "Container/Container";
import {CreateProfileController} from "InvestmentAccounts/Infrastructure/Ports/Controller/CreateProfileController";
import {
    AccountManagementController
} from "InvestmentAccounts/Infrastructure/Ports/Controller/AccountManagementController";

export type InvestmentAccountsApiType = {
    createProfile: CreateProfileController["execute"],
    openAccount: AccountManagementController["openAccount"],
}

export const investmentAccountsApi = (container: ContainerInterface): InvestmentAccountsApiType => ({
    createProfile: container.delegateTo(CreateProfileController, 'execute'),
    openAccount: container.delegateTo(AccountManagementController, 'openAccount')
})
