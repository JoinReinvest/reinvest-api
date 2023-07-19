import { PortfolioUpdatesRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioUpdatesRepository';
import { PortfolioAuthorsRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioAuthors';
import { FileLink } from 'Documents/Adapter/S3/FileLinkService';
import { DocumentsService } from 'Portfolio/Adapter/Documents/DocumentsService';

export class GetPortfolioUpdates {
  private portfolioUpdatesRepository: PortfolioUpdatesRepository;
  private portfolioAuthorsRepository: PortfolioAuthorsRepository;
  private documents: DocumentsService;

  constructor(portfolioUpdatesRepository: PortfolioUpdatesRepository, portfolioAuthorsRepository: PortfolioAuthorsRepository, documents: DocumentsService) {
    this.portfolioUpdatesRepository = portfolioUpdatesRepository;
    this.portfolioAuthorsRepository = portfolioAuthorsRepository;
    this.documents = documents;
  }

  public static getClassName = (): string => 'GetPortfolioUpdates';

  public async execute() {
    const portfolioUpdates = await this.portfolioUpdatesRepository.getAll();
    const portfolioUpdatesData = [];

    if (!portfolioUpdates || portfolioUpdates.length === 0) {
      return [];
    }

    for (const update of portfolioUpdates) {
      const { portfolioAuthorId, ...data } = update.toObject();
      const { image } = data;

      if (image) {
        const imgLink = <FileLink>await this.documents.getImageFileLink({ id: image.id, path: image.url });
        Object.assign(data.image, { url: imgLink.url, id: image.id });
      }

      const author = await this.portfolioAuthorsRepository.get(portfolioAuthorId);

      if (!author) {
        portfolioUpdatesData.push({ ...data, author: null });
      } else {
        const avatarData = author.toObject();

        if (avatarData.avatar) {
          const imgLink = <FileLink>await this.documents.getImageFileLink({ id: avatarData.avatar.id, path: avatarData.avatar.url });
          Object.assign(avatarData.avatar, { url: imgLink.url, id: avatarData.avatar.id });
        }

        portfolioUpdatesData.push({ ...data, author: avatarData });
      }
    }

    return portfolioUpdatesData;
  }
}
