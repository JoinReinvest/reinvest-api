import { UUID } from 'HKEKTypes/Generics';
import { DataJson } from 'Portfolio/Domain/types';
import { RegisterPortfolio } from 'Portfolio/UseCase/RegisterPortfolio';
import SynchronizePortfolio from 'Portfolio/UseCase/SynchronizePortfolio';
import { UpdateProperty, UpdatePropertyInput } from 'Portfolio/UseCase/UpdateProperty';
import { GetProperties } from 'Reinvest/Portfolio/src/UseCase/GetProperties';

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
  private getPropertiesUseCase: GetProperties;
  private registerPortfolioUseCase: RegisterPortfolio;

  constructor(
    synchronizePortfolioUseCase: SynchronizePortfolio,
    updatePropertyUseCase: UpdateProperty,
    getPropertiesUseCase: GetProperties,
    registerPortfolioUseCase: RegisterPortfolio,
  ) {
    this.synchronizePortfolioUseCase = synchronizePortfolioUseCase;
    this.updatePropertyUseCase = updatePropertyUseCase;
    this.getPropertiesUseCase = getPropertiesUseCase;
    this.registerPortfolioUseCase = registerPortfolioUseCase;
  }

  static getClassName = (): string => 'PortfolioController';

  async synchronizePortfolio(portfolioId: UUID) {
    return this.synchronizePortfolioUseCase.execute(portfolioId);
  }

  async updateProperty(input: UpdatePropertyInput, propertyId: number, portfolioId: UUID) {
    return this.updatePropertyUseCase.execute(input, propertyId, portfolioId);
  }

  async getActivePortfolio(): Promise<{ portfolioId: string; portfolioName: string }> {
    return { portfolioId: '34ccfe14-dc18-40df-a1d6-04f33b9fa7f4', portfolioName: 'Community REIT' };
  }

  async getProperties(portfolioId: UUID) {
    return this.getPropertiesUseCase.execute(portfolioId);
  }

  async getPortfolio(portfolioId: string): Promise<{ portfolioId: string; portfolioName: string }> {
    return this.getActivePortfolio();
  }

  async getCurrentSharePrice(portfolioId: UUID): Promise<number> {
    return 107;
  }

  async getPortfolioDetails(portfolioId: string): Promise<PortfolioDetails> {
    const portfolio = await this.getPortfolio(portfolioId);

    const properties = await this.getProperties(portfolio.portfolioId);

    return {
      id: portfolio.portfolioId,
      name: portfolio.portfolioName,
      properties: properties,
    };
  }

  async getPortfolioVendorsConfiguration(portfolioId: string): Promise<{
    ncOfferingId: string;
    vertaloAllocationId: string;
  }> {
    return {
      ncOfferingId: '1290029',
      vertaloAllocationId: '6a03167e-28d1-4378-b881-a5ade307b81b',
    };
  }

  async getCurrentNav(portfolioId: string): Promise<{ numberOfShares: number; unitSharePrice: number }> {
    return {
      unitSharePrice: 107,
      numberOfShares: 100000000,
    };
  }

  async getAbsoluteCurrentNav(portfolioId: string): Promise<{ numberOfShares: number; unitSharePrice: number }> {
    return {
      unitSharePrice: 107,
      numberOfShares: 100000000,
    };
  }

  async getDataForSubscriptionAgreement(portfolioId: UUID): Promise<SubscriptionAgreementPortfolioData> {
    return {
      nameOfAsset: 'Community REIT',
      nameOfOffering: 'Community REIT',
      offeringsCircularLink: 'https://link-to-offering-circular.com',
    };
  }

  async registerPortfolio(
    name: string,
    northCapitalOfferingId: string,
    vertaloAllocationId: string,
    linkToOfferingCircular: string,
  ): Promise<{
    errors: string[];
    portfolioId: string | null;
  }> {
    try {
      const portfolioId = await this.registerPortfolioUseCase.execute(name, northCapitalOfferingId, vertaloAllocationId, linkToOfferingCircular);

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
}
