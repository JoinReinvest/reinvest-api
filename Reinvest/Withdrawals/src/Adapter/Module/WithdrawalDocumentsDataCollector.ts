import { UUID } from 'HKEKTypes/Generics';
import { LegalEntities } from 'LegalEntities/index';
import { Portfolio } from 'Portfolio/index';
import { Registration } from 'Registration/index';
import { SharesAndDividends } from 'SharesAndDividends/index';

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

export type Email = string;

export class WithdrawalDocumentsDataCollector {
  public static getClassName = () => 'WithdrawalDocumentsDataCollector';
  private legalEntitiesModule: LegalEntities.Main;
  private portfolioModule: Portfolio.Main;
  private registrationModule: Registration.Main;
  private sharesAndDividendsModule: SharesAndDividends.Main;

  constructor(
    legalEntitiesModule: LegalEntities.Main,
    portfolioModule: Portfolio.Main,
    registrationModule: Registration.Main,
    sharesAndDividendsModule: SharesAndDividends.Main,
  ) {
    this.legalEntitiesModule = legalEntitiesModule;
    this.portfolioModule = portfolioModule;
    this.registrationModule = registrationModule;
    this.sharesAndDividendsModule = sharesAndDividendsModule;
  }

  async collectDataForWithdrawalAgreement(profileId: UUID, accountId: UUID): Promise<WithdrawalAgreementData> {
    const { portfolioId } = await this.portfolioModule.api().getActivePortfolio();
    const { nameOfOffering } = await this.portfolioModule.api().getPortfolioAssetDetails(portfolioId);
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

  async getSharesOriginalOwners(sharesIds: UUID[]): Promise<Record<UUID, UUID>> {
    if (!sharesIds.length) {
      return {};
    }

    const sharesOwners = await this.sharesAndDividendsModule.api().getSharesOriginalOwners(sharesIds);
    const sharesIdToOwner: Record<UUID, UUID> = {};
    sharesOwners.forEach(owner => (sharesIdToOwner[owner.sharesId] = owner.originalOwnerId));

    return sharesIdToOwner;
  }

  async getAssetName(): Promise<string> {
    const { portfolioId } = await this.portfolioModule.api().getActivePortfolio();
    const { nameOfAsset } = await this.portfolioModule.api().getPortfolioAssetDetails(portfolioId);

    return nameOfAsset;
  }

  async getAccountsEmails(accountsIds: UUID[]): Promise<Record<UUID, Email>> {
    const investorEmails = await this.registrationModule.api().getInvestorEmails(accountsIds);
    const accountToData: Record<UUID, Email> = {};

    investorEmails.forEach(({ accountId, email }) => {
      accountToData[accountId] = email;
    });

    return accountToData;
  }

  async getProfilesNames(profileIds: UUID[]): Promise<Record<UUID, string>> {
    const ownersNames = await this.legalEntitiesModule.api().getProfileNames(profileIds);

    const profileToName: Record<UUID, string> = {};

    ownersNames.forEach(({ profileId, name }) => {
      profileToName[profileId] = name;
    });

    return profileToName;
  }
}
