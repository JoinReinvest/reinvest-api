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

export class SubscriptionAgreementDataCollector {
  public static getClassName = () => 'SubscriptionAgreementDataCollector';
  private legalEntitiesModule: LegalEntities.Main;
  private portfolioModule: Portfolio.Main;

  constructor(legalEntitiesModule: LegalEntities.Main, portfolioModule: Portfolio.Main) {
    this.legalEntitiesModule = legalEntitiesModule;
    this.portfolioModule = portfolioModule;
  }

  async collectData(portfolioId: UUID, profileId: UUID, accountId: UUID): Promise<PortfolioData & LegalEntitiesData> {
    const portfolioData = await this.portfolioModule.api().getPortfolioAssetDetails(portfolioId);
    const legalEntitiesData = await this.legalEntitiesModule.api().getInvestorDataForAgreements(profileId, accountId);

    return {
      ...portfolioData,
      ...legalEntitiesData,
    };
  }
}
