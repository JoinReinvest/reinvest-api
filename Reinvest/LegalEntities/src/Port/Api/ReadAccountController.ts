import {
  AccountRepository,
  CompanyAccountForSynchronization,
  CompanyForSynchronization,
  IndividualAccountForSynchronization,
  StakeholderForSynchronization,
} from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { AccountType } from 'LegalEntities/Domain/AccountType';
import { AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { DocumentSchema } from 'LegalEntities/Domain/ValueObject/Document';
import { StakeholderInput, StakeholderOutput, StakeholderSchema } from 'LegalEntities/Domain/ValueObject/Stakeholder';
import { AvatarOutput, AvatarQuery } from 'LegalEntities/Port/Api/AvatarQuery';

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
  label: string;
};

export type CompanyAccountResponse = {
  avatar: AvatarOutput;
  details: {
    address: AddressInput;
    annualRevenue: {
      range: string;
    };
    companyDocuments: {
      fileName: string;
      id: string;
    }[];
    companyName: {
      name: string;
    };
    companyType: {
      type: string;
    };
    ein: string;
    industry: {
      value: string;
    };
    numberOfEmployees: {
      range: string;
    };
    stakeholders: StakeholderOutput[];
  };
  id: string;
  label: string;
};

export type AccountsOverviewResponse = {
  avatar: AvatarOutput;
  id: string;
  label: string;
  type: AccountType;
};

export class ReadAccountController {
  public static getClassName = (): string => 'ReadAccountController';
  private accountRepository: AccountRepository;
  private avatarQuery: AvatarQuery;

  constructor(accountRepository: AccountRepository, avatarQuery: AvatarQuery) {
    this.accountRepository = accountRepository;
    this.avatarQuery = avatarQuery;
  }

  public async getIndividualAccount(profileId: string): Promise<IndividualAccountResponse> {
    const account = await this.accountRepository.findIndividualAccount(profileId);

    if (account === null) {
      return {} as IndividualAccountResponse;
    }

    const accountObject = account.toObject();

    return {
      id: accountObject.accountId,
      label: account.getLabel(),
      avatar: await this.avatarQuery.getAvatarForAccount(account),
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

  public async getCompanyAccountForSynchronization(profileId: string, accountId: string): Promise<CompanyAccountForSynchronization | null> {
    return this.accountRepository.getCompanyAccountForSynchronization(profileId, accountId);
  }

  public async getCompanyForSynchronization(profileId: string, accountId: string): Promise<CompanyForSynchronization | null> {
    return this.accountRepository.getCompanyForSynchronization(profileId, accountId);
  }

  public async getStakeholderForSynchronization(profileId: string, accountId: string, stakeholderId: string): Promise<StakeholderForSynchronization | null> {
    return this.accountRepository.getStakeholderForSynchronization(profileId, accountId, stakeholderId);
  }

  public async getAccountsOverview(profileId: string): Promise<AccountsOverviewResponse[]> {
    const accountsOverview = <AccountsOverviewResponse[]>[];

    const individualAccount = await this.accountRepository.findIndividualAccountOverview(profileId);

    if (individualAccount !== null) {
      accountsOverview.push(<AccountsOverviewResponse>{
        id: individualAccount.getId(),
        type: AccountType.INDIVIDUAL,
        label: individualAccount.getLabel(),
        avatar: await this.avatarQuery.getAvatarForAccount(individualAccount),
      });
    }

    const companyAccounts = await this.accountRepository.findCompanyAccountOverviews(profileId);

    for (const companyAccount of companyAccounts) {
      accountsOverview.push(<AccountsOverviewResponse>{
        id: companyAccount.getId(),
        type: companyAccount.getAccountType(),
        label: companyAccount.getLabel(),
        avatar: await this.avatarQuery.getAvatarForAccount(companyAccount),
      });
    }

    return accountsOverview;
  }

  public async getCompanyAccount(profileId: string, accountId: string): Promise<CompanyAccountResponse> {
    const account = await this.accountRepository.findCompanyAccount(profileId, accountId);

    if (account === null) {
      return {} as CompanyAccountResponse;
    }

    const accountObject = account.toObject();

    return {
      id: accountObject.accountId,
      label: account.getLabel(),
      avatar: await this.avatarQuery.getAvatarForAccount(account),
      details: {
        companyName: accountObject.companyName,
        address: accountObject.address,
        ein: accountObject.ein.anonymized,
        annualRevenue: accountObject.annualRevenue,
        numberOfEmployees: accountObject.numberOfEmployees,
        industry: accountObject.industry,
        companyType: accountObject.companyType,
        companyDocuments: accountObject.companyDocuments.map((companyDocument: DocumentSchema) => ({
          id: companyDocument.id,
          fileName: companyDocument.fileName,
        })),
        stakeholders: accountObject.stakeholders.map(
          (stakeholder: StakeholderSchema): StakeholderOutput => ({
            ...stakeholder,
            ssn: stakeholder.ssn.anonymized,
            idScan: stakeholder.idScan.map((idScan: DocumentSchema) => ({
              id: idScan.id,
              fileName: idScan.fileName,
            })),
          }),
        ),
      },
    };
  }
}
