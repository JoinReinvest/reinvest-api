import { UUID } from 'HKEKTypes/Generics';

import SynchronizePortfolio from '../../UseCase/SynchronizePortfolio';

type Property = {
  POIs: { description: string; image: string; name: string }[];
  address: {
    addressLine: string;
    city: string;
    zip: string;
  };
  gallery: string[];
  image: string;
  impactMetrics: {
    jobsCreated: string;
    totalProjectSize: string;
    units: string;
  };
  keyMetrics: {
    projectReturn: string;
    rating: string;
    structure: string;
  };
  location: {
    lat: string;
    lng: string;
  };
  name: string;
};

type PortfolioDetails = {
  id: string;
  name: string;
  properties: Property[];
};

const propertyMock = (name: string, addressLine: string, city: string, zip: string): Property => ({
  keyMetrics: {
    projectReturn: '10%',
    structure: 'Equity',
    rating: 'A',
  },
  POIs: [
    {
      name: 'Good Schools',
      description: 'Good Schools and education opportunities',
      image: 'https://picsum.photos/52/52',
    },
    {
      name: 'Vehicle-Dependent',
      description: 'Some public transit available',
      image: 'https://picsum.photos/52/52',
    },
  ],
  impactMetrics: {
    units: '10%',
    totalProjectSize: '-',
    jobsCreated: '300',
  },
  name,
  address: {
    addressLine,
    city,
    zip,
  },
  image: 'https://picsum.photos/1352/296',
  gallery: ['https://picsum.photos/435/200', 'https://picsum.photos/435/200', 'https://picsum.photos/435/200', 'https://picsum.photos/435/200'],
  location: {
    lat: '37.572',
    lng: '-101.373',
  },
});

/**
 * Returns mock data for the active portfolio
 */
export class PortfolioController {
  private synchronizePortfolioUseCase: SynchronizePortfolio;

  constructor(synchronizePortfolioUseCase: SynchronizePortfolio) {
    this.synchronizePortfolioUseCase = synchronizePortfolioUseCase;
  }

  static getClassName = (): string => 'PortfolioController';

  async synchronizePortfolio(portfolioId: UUID) {
    return this.synchronizePortfolioUseCase.execute(portfolioId);
  }

  async getActivePortfolio(): Promise<{ portfolioId: string; portfolioName: string }> {
    return { portfolioId: '34ccfe14-dc18-40df-a1d6-04f33b9fa7f4', portfolioName: 'Community REIT' };
  }

  async getPortfolio(portfolioId: string): Promise<{ portfolioId: string; portfolioName: string }> {
    return this.getActivePortfolio();
  }

  async getPortfolioDetails(portfolioId: string): Promise<PortfolioDetails> {
    const portfolio = await this.getPortfolio(portfolioId);

    return {
      id: portfolio.portfolioId,
      name: portfolio.portfolioName,
      properties: [
        propertyMock('Ulysses, KS', '4781 Ridge Road', 'Ulysses', 'KS 16804'),
        propertyMock('Kingsform, MI', '1613 S Park St', 'Kingsform', 'MI 49802'),
        propertyMock('New York, NY', '1615 S Park St', 'New York', 'MI 69804'),
        propertyMock('Chicago, CG', '1614 S Park St', 'Chicago', 'MI 59803'),
      ],
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
      unitSharePrice: 105,
      numberOfShares: 100000000,
    };
  }
}
