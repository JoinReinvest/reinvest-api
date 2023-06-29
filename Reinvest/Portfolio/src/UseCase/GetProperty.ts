import { UUID } from 'HKEKTypes/Generics';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { DocumentsService } from 'Portfolio/Service/DocumentsService';

export class GetProperty {
  private portfolioRepository: PortfolioRepository;
  private documents: DocumentsService;

  constructor(portfolioRepository: PortfolioRepository, documents: DocumentsService) {
    this.portfolioRepository = portfolioRepository;
    this.documents = documents;
  }

  public static getClassName = (): string => 'GetProperty';

  public async execute(propertyId: number, portfolioId: UUID) {
    const property = await this.portfolioRepository.getById(propertyId);

    if (!property) {
      return false;
    }

    const { dataJson, id, status, lastUpdate } = property.toObject();

    const { image, gallery, POIs } = dataJson;

    const data = { ...dataJson };

    if (image) {
      const imgLink = await this.documents.getImageFileLink({ id: image.id, path: image.path });
      Object.assign(data, { image: imgLink });
    }

    if (gallery && gallery?.length !== 0) {
      const images = [];

      for (const image of gallery) {
        const img = await this.documents.getImageFileLink({ id: image.id, path: image.path });
        images.push(img);
      }

      Object.assign(data, { gallery: images });
    }

    if (POIs && POIs.length !== 0) {
      const pois = [];

      for (const poi of POIs) {
        const img = await this.documents.getImageFileLink({ id: poi.id, path: poi.path });
        pois.push({ name: poi.name, description: poi.description, image: img });
      }

      Object.assign(data, { POIs: pois });
    }

    return {
      id,
      portfolioId,
      status,
      lastUpdate,
      data,
    };
  }
}
