import { UUID } from 'HKEKTypes/Generics';
import { LegalEntities } from 'LegalEntities/index';
import { Portfolio } from 'Portfolio/index';
import { Registration } from 'Registration/index';

export type WithdrawalAgreementData = {
  address: string;
  authorizedOfficer: string;
  email: string;
  fundSeriesName: string;
  isCompany: boolean;
  phoneNumber: string;
  sharesOwnerName: string;
};

export type BankAccountMapping = {
  accountId: UUID;
  ncAccountId: string;
  ncAccountNumber: string;
  profileId: UUID;
};

export class WithdrawalDocumentsDataCollector {
  public static getClassName = () => 'WithdrawalDocumentsDataCollector';
  private legalEntitiesModule: LegalEntities.Main;
  private portfolioModule: Portfolio.Main;
  private registrationModule: Registration.Main;

  constructor(legalEntitiesModule: LegalEntities.Main, portfolioModule: Portfolio.Main, registrationModule: Registration.Main) {
    this.legalEntitiesModule = legalEntitiesModule;
    this.portfolioModule = portfolioModule;
    this.registrationModule = registrationModule;
  }

  async collectDataForWithdrawalAgreement(portfolioId: UUID, profileId: UUID, accountId: UUID): Promise<WithdrawalAgreementData> {
    const { nameOfOffering } = await this.portfolioModule.api().getDataForSubscriptionAgreement(portfolioId);
    const legalEntitiesData = await this.legalEntitiesModule.api().getDataForWithdrawalAgreement(profileId, accountId);

    return {
      fundSeriesName: nameOfOffering,
      ...legalEntitiesData,
    };
  }

  async mapAccountsToNorthCapital(profilesToAccounts: Record<UUID, UUID[]>): Promise<Record<UUID, BankAccountMapping>> {
    const parents = await this.mapAccountParents(profilesToAccounts);

    const listOfAccounts: UUID[] = [];

    for (const accounts of Object.values(profilesToAccounts)) {
      for (const accountId of accounts) {
        const accountToAdd = parents[accountId] ?? accountId;

        if (listOfAccounts.includes(accountToAdd)) {
          continue;
        }

        listOfAccounts.push(accountToAdd);
      }
    }

    const bankAccountMappings = await this.registrationModule.api().mapAccountsToNorthCapitalPayoutData(listOfAccounts);

    return this.mapAccountToBankAccountMapping(bankAccountMappings, parents);
  }

  private async mapAccountParents(profilesToAccounts: Record<UUID, UUID[]>): Promise<Record<UUID, UUID>> {
    const parents: Record<UUID, UUID> = {};

    for (const [profileId, accounts] of Object.entries(profilesToAccounts)) {
      for (const accountId of accounts) {
        const parentId = await this.legalEntitiesModule.api().mapAccountIdToParentAccountIdIfRequired(profileId, accountId);

        if (parentId !== accountId) {
          parents[accountId] = parentId;
        }
      }
    }

    return parents;
  }

  private async mapAccountToBankAccountMapping(
    bankAccountMappings: BankAccountMapping[],
    parents: Record<UUID, UUID>,
  ): Promise<Record<UUID, BankAccountMapping>> {
    const children: Record<UUID, UUID> = {};
    Object.entries(parents).forEach(([key, value]) => {
      children[value] = key;
    });
    const mappings: Record<UUID, BankAccountMapping> = {};

    for (const mapping of bankAccountMappings) {
      const { accountId } = mapping;
      const mappedAccountId = children[accountId] ?? accountId;

      if (mappings[mappedAccountId]) {
        continue;
      }

      mappings[mappedAccountId] = mapping;
    }

    return mappings;
  }
}
