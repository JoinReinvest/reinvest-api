import {ContainerInterface} from "Container/Container";
import {CreateProfileController} from "InvestmentAccounts/Infrastructure/Ports/Controller/CreateProfileController";

export type InvestmentAccountsApiType = {
    createProfile: CreateProfileController["execute"],
}

export const investmentAccountsApi = (container: ContainerInterface): InvestmentAccountsApiType => ({
    createProfile: container.delegateTo(CreateProfileController, 'execute'),
})
