import {DocumentsService} from "LegalEntities/Adapter/Modules/DocumentsService";
import {AccountRepository} from "LegalEntities/Adapter/Database/Repository/AccountRepository";
import {AvatarInput} from "LegalEntities/Domain/ValueObject/Document";
import {AccountType} from "LegalEntities/Domain/AccountType";
import {IndividualAccount} from "LegalEntities/Domain/Accounts/IndividualAccount";

export type AvatarOutput = {
    id?: string,
    url?: string,
    initials?: string,
}
export type IndividualAccountResponse = {
    id: string,
    profileId: string,
    avatar: AvatarOutput,
    details: {
        employmentStatus: {
            status?: string,
        },
        employer: {
            nameOfEmployer?: string,
            title?: string,
            industry?: string,
        },
        netWorth: {
            range?: string,
        },
        netIncome: {
            range?: string,
        },
    }
}

export type AccountsOverviewResponse = {
    id: string,
    type: AccountType,
    avatar: AvatarOutput,
}

export class ReadAccountController {
    public static getClassName = (): string => "ReadAccountController";
    private accountRepository: AccountRepository;
    private documents: DocumentsService;

    constructor(accountRepository: AccountRepository, documents: DocumentsService) {
        this.accountRepository = accountRepository;
        this.documents = documents;
    }

    public async getIndividualAccount(profileId: string, accountId: string): Promise<IndividualAccountResponse> {
        const account = await this.accountRepository.findIndividualAccount(profileId, accountId);
        if (account === null) {
            return {} as IndividualAccountResponse;
        }

        const accountObject = account.toObject();

        const avatar = await this.documents.getAvatarFileLink(accountObject.avatar === null ? null : accountObject.avatar as AvatarInput);

        return {
            id: accountObject.accountId,
            profileId: accountObject.profileId,
            avatar: {
                ...avatar,
                initials: account.getInitials(),
            },
            details: {
                employmentStatus: {
                    status: accountObject.employmentStatus?.status,
                },
                employer: {
                    nameOfEmployer: accountObject.employer?.nameOfEmployer,
                    title: accountObject.employer?.title,
                    industry: accountObject.employer?.industry,
                },
                netWorth: {
                    range: accountObject.netWorth?.range,
                },
                netIncome: {
                    range: accountObject.netIncome?.range,
                }
            },

        }
    }

    public async getAccountsOverview(profileId: string): Promise<AccountsOverviewResponse[]> {
        const accounts = await this.accountRepository.getAllIndividualAccounts(profileId);

        return Promise.all(accounts.map(async (account) => {
            return await this.mapAccountToOverview(account);
        }));
    }

    private async mapAccountToOverview(account: IndividualAccount): Promise<AccountsOverviewResponse> {
        const accountObject = account.toObject();
        const avatar = await this.documents.getAvatarFileLink(accountObject.avatar === null ? null : accountObject.avatar as AvatarInput);
        return <AccountsOverviewResponse>{
            id: accountObject.accountId,
            type: AccountType.INDIVIDUAL,
            avatar: {
                ...avatar,
                initials: account.getInitials(),
            },
        };
    }
}
