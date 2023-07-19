import { PortfolioAuthorsRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioAuthors';
import { FileLink } from 'Documents/Adapter/S3/FileLinkService';
import { DocumentsService } from 'Portfolio/Adapter/Documents/DocumentsService';

export class GetPortfolioAuthors {
  private portfolioAuthorsRepository: PortfolioAuthorsRepository;
  private documents: DocumentsService;

  constructor(portfolioUpdatesRepository: PortfolioAuthorsRepository, documents: DocumentsService) {
    this.portfolioAuthorsRepository = portfolioUpdatesRepository;
    this.documents = documents;
  }

  public static getClassName = (): string => 'GetPortfolioAuthors';

  public async execute() {
    const portfolioAuthors = await this.portfolioAuthorsRepository.getAll();
    const portfolioUpdatesData = [];

    if (!portfolioAuthors || portfolioAuthors.length === 0) {
      return [];
    }

    for (const update of portfolioAuthors) {
      const data = update.toObject();
      const { avatar } = data;

      if (avatar) {
        const imgLink = <FileLink>await this.documents.getImageFileLink({ id: avatar.id, path: avatar.url });
        Object.assign(data.avatar, { url: imgLink.url, id: avatar.id });
      }

      portfolioUpdatesData.push(data);
    }

    return portfolioUpdatesData;
  }
}
