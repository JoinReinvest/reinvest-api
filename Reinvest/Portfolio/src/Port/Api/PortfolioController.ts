import { UUID } from 'HKEKTypes/Generics';
import { NavView } from 'Portfolio/Domain/Nav';
import { DataJson } from 'Portfolio/Domain/types';
import { PortfolioQuery } from 'Portfolio/UseCase/PortfolioQuery';
import { RegisterPortfolio } from 'Portfolio/UseCase/RegisterPortfolio';
import { SynchronizeUnitPrice } from 'Portfolio/UseCase/SynchronizeUnitPrice';
import SynchronizePortfolio from 'Portfolio/UseCase/SynchronizePortfolio';
import { UpdateProperty, UpdatePropertyInput } from 'Portfolio/UseCase/UpdateProperty';
import { SetCurrentNav } from 'Portfolio/UseCase/SetCurrentNav';
import { Money } from 'Money/Money';

type PortfolioDetails = {
  id: string;
  name: string;
  properties: DataJson[];
};

type SubscriptionAgreementPortfolioData = {
  nameOfAsset: string;
  nameOfOffering: string;
  offeringsCircularLink: string;
};

/**
 * Returns mock data for the active portfolio
 */
export class PortfolioController {
  private synchronizePortfolioUseCase: SynchronizePortfolio;
  private updatePropertyUseCase: UpdateProperty;
  private portfolioQuery: PortfolioQuery;
  private registerPortfolioUseCase: RegisterPortfolio;
  private synchronizeUnitPriceUseCase: SynchronizeUnitPrice;
  private setCurrentNavUseCase: SetCurrentNav;

  constructor(
    synchronizePortfolioUseCase: SynchronizePortfolio,
    updatePropertyUseCase: UpdateProperty,
    portfolioQuery: PortfolioQuery,
    registerPortfolioUseCase: RegisterPortfolio,
    synchronizeNavUseCase: SynchronizeUnitPrice,
    setCurrentNavUseCase: SetCurrentNav,
  ) {
    this.synchronizePortfolioUseCase = synchronizePortfolioUseCase;
    this.updatePropertyUseCase = updatePropertyUseCase;
    this.portfolioQuery = portfolioQuery;
    this.registerPortfolioUseCase = registerPortfolioUseCase;
    this.synchronizeUnitPriceUseCase = synchronizeNavUseCase;
    this.setCurrentNavUseCase = setCurrentNavUseCase;
  }

  static getClassName = (): string => 'PortfolioController';

  async synchronizePortfolio(portfolioId: UUID) {
    return this.synchronizePortfolioUseCase.execute(portfolioId);
  }

  async updateProperty(input: UpdatePropertyInput, propertyId: number, portfolioId: UUID) {
    return this.updatePropertyUseCase.execute(input, propertyId, portfolioId);
  }

  async getActivePortfolio(): Promise<{ portfolioId: string; portfolioName: string }> {
    return this.portfolioQuery.getActivePortfolio();
  }

  async getPortfolioDetails(portfolioId: string): Promise<PortfolioDetails | null> {
    return this.portfolioQuery.getPortfolioDetails(portfolioId);
  }

  async getPortfolioVendorsConfiguration(portfolioId: string): Promise<{
    ncOfferingId: string;
    vertaloAllocationId: string;
  }> {
    const portfolio = await this.portfolioQuery.getPortfolio(portfolioId);
    const data = portfolio.toObject();

    return {
      ncOfferingId: data.northCapitalOfferingId,
      vertaloAllocationId: data.vertaloAllocationId,
    };
  }

  async getPortfolioAssetDetails(portfolioId: UUID): Promise<SubscriptionAgreementPortfolioData> {
    const portfolio = await this.portfolioQuery.getPortfolio(portfolioId);
    const data = portfolio.toObject();

    return {
      nameOfAsset: data.assetName,
      nameOfOffering: data.offeringName,
      offeringsCircularLink: data.linkToOfferingCircular,
    };
  }

  async registerPortfolio(
    name: string,
    northCapitalOfferingId: string,
    vertaloAllocationId: string,
    linkToOfferingCircular: string,
    initUnitNav: number,
    initNumberOfSharesForNav: number,
  ): Promise<{
    errors: string[];
    portfolioId: string | null;
  }> {
    try {
      const portfolioId = await this.registerPortfolioUseCase.execute(
        name,
        northCapitalOfferingId,
        vertaloAllocationId,
        linkToOfferingCircular,
        initUnitNav,
        initNumberOfSharesForNav,
      );

      return {
        errors: [],
        portfolioId,
      };
    } catch (error: any) {
      return {
        errors: [error.message],
        portfolioId: null,
      };
    }
  }

  async getCurrentNav(portfolioId: string): Promise<NavView> {
    return this.portfolioQuery.getCurrentNav(portfolioId);
  }

  async getCurrentUnitPrice(portfolioId: string): Promise<any> {
    return this.portfolioQuery.getCurrentUnitPrice(portfolioId);
  }

  async setPortfolioNav(portfolioId: UUID, unitNav: number, numberOfSharesForNav: number): Promise<boolean> {
    const unitNavMoney = Money.lowPrecision(unitNav);
    if (numberOfSharesForNav <= 0) {
      return false;
    }

    return this.setCurrentNavUseCase.execute(portfolioId, unitNavMoney, numberOfSharesForNav);
  }

  async synchronizePortfolioUnitPrice(portfolioId: UUID): Promise<boolean> {
    return this.synchronizeUnitPriceUseCase.execute(portfolioId);
  }
}
