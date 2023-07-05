import { UUID } from 'HKEKTypes/Generics';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { DealpathAdapter } from 'Portfolio/Adapter/Dealpath/DealpathAdapter';

class SynchronizePortfolio {
  private portfolioRepository: PortfolioRepository;
  private dealpathAdapter: DealpathAdapter;

  constructor(portfolioRepository: PortfolioRepository, dealpathAdapter: DealpathAdapter) {
    this.portfolioRepository = portfolioRepository;
    this.dealpathAdapter = dealpathAdapter;
  }

  static getClassName = () => 'SynchronizePortfolio';

  async execute(portfolioId: UUID): Promise<boolean> {
    const properties = await this.dealpathAdapter.getProperties(portfolioId);

    if (!properties || properties.length === 0) {
      return false;
    }

    for (const property of properties) {
      const propertyWithGivenId = await this.portfolioRepository.getById(property.getId());

      if (propertyWithGivenId) {
        property.setAdminJson(propertyWithGivenId.getAdminJson());
        await this.portfolioRepository.updateProperty(property);
      } else {
        await this.portfolioRepository.createProperty(property);
      }
    }

    const propertiesInDb = await this.portfolioRepository.getAll(portfolioId);

    if (propertiesInDb && propertiesInDb.length) {
      const propertiesToArchive = propertiesInDb.filter(property => {
        return !properties.find(el => el.getId() === property.getId());
      });

      for (const property of propertiesToArchive) {
        property.archive();

        await this.portfolioRepository.updateProperty(property);
      }
    }

    return true;
  }
}

export default SynchronizePortfolio;
