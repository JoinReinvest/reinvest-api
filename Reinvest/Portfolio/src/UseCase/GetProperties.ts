import { UUID } from 'HKEKTypes/Generics';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { DocumentsService } from 'Reinvest/Portfolio/src/Adapter/Documents/DocumentsService';

export class GetProperties {
  private portfolioRepository: PortfolioRepository;
  private documents: DocumentsService;

  constructor(portfolioRepository: PortfolioRepository, documents: DocumentsService) {
    this.portfolioRepository = portfolioRepository;
    this.documents = documents;
  }

  public static getClassName = (): string => 'GetProperties';

  public async execute(portfolioId: UUID) {
    const properties = await this.portfolioRepository.getAll(portfolioId);

    const propertiesData = [];

    if (!properties || properties.length === 0) {
      return [];
    }

    for (const property of properties) {
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
          const img = await this.documents.getImageFileLink({ id: poi.image, path: poi.path });
          pois.push({ name: poi.name, description: poi.description, image: img });
        }

        Object.assign(data, { POIs: pois });
      }

      if (data.address) {
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
}
