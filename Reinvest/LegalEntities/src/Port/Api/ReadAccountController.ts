import { AccountRepository, IndividualAccountForSynchronization } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { DocumentsService } from 'LegalEntities/Adapter/Modules/DocumentsService';
import { IndividualAccount } from 'LegalEntities/Domain/Accounts/IndividualAccount';
import { AccountType } from 'LegalEntities/Domain/AccountType';
import { AvatarInput } from 'LegalEntities/Domain/ValueObject/Document';

export type AvatarOutput = {
  id?: string;
  initials?: string;
  url?: string;
};
export type IndividualAccountResponse = {
  avatar: AvatarOutput;
  details: {
    employer: {
      industry?: string;
      nameOfEmployer?: string;
      title?: string;
    };
    employmentStatus: {
      status?: string;
    };
    netIncome: {
      range?: string;
    };
    netWorth: {
      range?: string;
    };
  };
  id: string;
  profileId: string;
};

export type AccountsOverviewResponse = {
  avatar: AvatarOutput;
  id: string;
  type: AccountType;
};

export class ReadAccountController {
  public static getClassName = (): string => 'ReadAccountController';
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

    const avatar = await this.documents.getAvatarFileLink(accountObject.avatar === null ? null : (accountObject.avatar as AvatarInput));

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
        },
      },
    };
  }

  public async getIndividualAccountForSynchronization(profileId: string, accountId: string): Promise<IndividualAccountForSynchronization | null> {
    return this.accountRepository.getIndividualAccountForSynchronization(profileId, accountId);
  }

  public async getAccountsOverview(profileId: string): Promise<AccountsOverviewResponse[]> {
    const accounts = await this.accountRepository.getAllIndividualAccounts(profileId);

    return Promise.all(
      accounts.map(async account => {
        return await this.mapAccountToOverview(account);
      }),
    );
  }

  private async mapAccountToOverview(account: IndividualAccount): Promise<AccountsOverviewResponse> {
    const accountObject = account.toObject();
    const avatar = await this.documents.getAvatarFileLink(accountObject.avatar === null ? null : (accountObject.avatar as AvatarInput));

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
