import { FileLink } from 'Documents/Adapter/S3/FileLinkService';
import { UUID } from 'HKEKTypes/Generics';
import { PortfolioNavRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioNavRepository';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { PropertyRepository } from 'Portfolio/Adapter/Database/Repository/PropertyRepository';
import { NavView } from 'Portfolio/Domain/Nav';
import { Portfolio } from 'Portfolio/Domain/Portfolio';
import { DocumentsService } from 'Reinvest/Portfolio/src/Adapter/Documents/DocumentsService';

export type PortfolioDetails = {
  assetName: string;
  currentNav: NavView | null;
  id: UUID;
  linkToOfferingCircular: string;
  name: string;
  navHistory: NavView[];
  northCapitalOfferingId: string;
  offeringName: string;
  properties: any[];
  vertaloAllocationId: string;
};

export class PortfolioQuery {
  public static getClassName = (): string => 'PortfolioQuery';

  private propertyRepository: PropertyRepository;
  private documents: DocumentsService;
  private portfolioRepository: PortfolioRepository;
  private navRepository: PortfolioNavRepository;

  constructor(
    portfolioRepository: PortfolioRepository,
    navRepository: PortfolioNavRepository,
    propertyRepository: PropertyRepository,
    documents: DocumentsService,
  ) {
    this.portfolioRepository = portfolioRepository;
    this.navRepository = navRepository;
    this.propertyRepository = propertyRepository;
    this.documents = documents;
  }

  async getPortfolioDetails(portfolioId: string): Promise<PortfolioDetails | null> {
    const portfolio = await this.portfolioRepository.getById(portfolioId);

    if (!portfolio) {
      return null;
    }

    const properties = await this.getProperties(portfolioId);
    const navs = await this.navRepository.getNavHistory(portfolioId);
    const portfolioData = portfolio.toObject();

    return {
      id: portfolioData.id,
      name: portfolioData.name,
      northCapitalOfferingId: portfolioData.northCapitalOfferingId,
      offeringName: portfolioData.offeringName,
      vertaloAllocationId: portfolioData.vertaloAllocationId,
      assetName: portfolioData.assetName,
      linkToOfferingCircular: portfolioData.linkToOfferingCircular,
      properties,
      currentNav: navs[0] ? navs[0].forView() : null,
      navHistory: navs.map(nav => nav.forView()),
    };
  }

  private async getProperties(portfolioId: UUID): Promise<any[]> {
    const properties = await this.propertyRepository.getAll(portfolioId);

    const propertiesData = [];

    if (!properties || properties.length === 0) {
      return [];
    }

    for (const property of properties) {
      const { dataJson, id, status, lastUpdate } = property.toObject();

      const { image, gallery, POIs } = dataJson;

      const data = { ...dataJson };

      if (image) {
        const imgLink = <FileLink>await this.documents.getImageFileLink({ id: image.id, path: image.path });
        Object.assign(data, { image: imgLink.url });
      }

      if (gallery && gallery?.length !== 0) {
        const images = [];

        for (const image of gallery) {
          const img = <FileLink>await this.documents.getImageFileLink({ id: image.id, path: image.path });
          images.push(img.url);
        }

        Object.assign(data, { gallery: images });
      }

      if (POIs && POIs.length !== 0) {
        const pois = [];

        for (const poi of POIs) {
          const img = <FileLink>await this.documents.getImageFileLink({ id: poi.image, path: poi.path });
          pois.push({ name: poi.name, description: poi.description, image: img.url });
        }

        Object.assign(data, { POIs: pois });
      }

      if (data.address) {
        data.location = {
          // @ts-ignore
          lat: data.address!.lat,
          // @ts-ignore
          lng: data.address!.lng,
        };
        let addressLine = data.address.address_1;

        if (data.address.address_2) {
          addressLine += `, ${data.address.address_2}`;
        }

        data.address = {
          // @ts-ignore
          addressLine,
          city: data.address.city,
          zip: data.address.postal_code,
        };
      }

      propertiesData.push({
        id,
        portfolioId,
        status,
        lastUpdate,
        ...data,
      });
    }

    return propertiesData;
  }

  async getActivePortfolio(): Promise<{ portfolioId: UUID; portfolioName: string }> {
    const portfolio = await this.portfolioRepository.getActivePortfolio();

    if (!portfolio) {
      throw new Error('No active portfolio');
    }

    const { id, name } = portfolio.toObject();

    return {
      portfolioId: id,
      portfolioName: name,
    };
  }

  async getCurrentNav(portfolioId: UUID): Promise<NavView> {
    const nav = await this.navRepository.getTheLatestNav(portfolioId);

    if (!nav) {
      throw new Error('No nav found');
    }

    return nav.forView();
  }

  async getPortfolio(portfolioId: UUID): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.getById(portfolioId);

    if (!portfolio) {
      throw new Error('No portfolio found');
    }

    return portfolio;
  }
}
