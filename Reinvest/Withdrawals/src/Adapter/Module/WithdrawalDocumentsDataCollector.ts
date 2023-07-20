import { UUID } from 'HKEKTypes/Generics';
import { LegalEntities } from 'LegalEntities/index';
import { Portfolio } from 'Portfolio/index';

type PortfolioData = {
  nameOfAsset: string;
  nameOfOffering: string;
  offeringsCircularLink: string;
};

type LegalEntitiesData = {
  address: string;
  companyName: string;
  dateOfBirth: string;
  email: string;
  firstName: string;
  isAccreditedInvestor: boolean;
  isFINRAMember: boolean;

  isTradedCompanyHolder: boolean;

  lastName: string;
  // identity
  phoneNumber: string;

  purchaserName: string;
  sensitiveNumber: string;

  FINRAInstitutionName?: string;
  tickerSymbols?: string;
};

export type WithdrawalAgreementData = {
  address: string;
  authorizedOfficer: string;
  email: string;
  fundSeriesName: string;
  isCompany: boolean;
  phoneNumber: string;
  sharesOwnerName: string;
};

export class WithdrawalDocumentsDataCollector {
  public static getClassName = () => 'WithdrawalDocumentsDataCollector';
  private legalEntitiesModule: LegalEntities.Main;
  private portfolioModule: Portfolio.Main;

  constructor(legalEntitiesModule: LegalEntities.Main, portfolioModule: Portfolio.Main) {
    this.legalEntitiesModule = legalEntitiesModule;
    this.portfolioModule = portfolioModule;
  }

  async collectDataForWithdrawalAgreement(portfolioId: UUID, profileId: UUID, accountId: UUID): Promise<WithdrawalAgreementData> {
    const { nameOfOffering } = await this.portfolioModule.api().getDataForSubscriptionAgreement(portfolioId);
    const legalEntitiesData = await this.legalEntitiesModule.api().getDataForWithdrawalAgreement(profileId, accountId);

    return {
      fundSeriesName: nameOfOffering,
      ...legalEntitiesData,
    };
  }
}
