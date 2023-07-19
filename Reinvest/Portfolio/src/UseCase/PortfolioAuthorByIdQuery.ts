import { PortfolioAuthorsRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioAuthors';
import { FileLink } from 'Documents/Adapter/S3/FileLinkService';
import { DocumentsService } from 'Portfolio/Adapter/Documents/DocumentsService';

export class PortfolioAuthorByIdQuery {
  private portfolioAuthorsRepository: PortfolioAuthorsRepository;
  private documents: DocumentsService;

  constructor(portfolioUpdatesRepository: PortfolioAuthorsRepository, documents: DocumentsService) {
    this.portfolioAuthorsRepository = portfolioUpdatesRepository;
    this.documents = documents;
  }

  public static getClassName = (): string => 'PortfolioAuthorByIdQuery';

  public async execute(id: string) {
    const portfolioAuthor = await this.portfolioAuthorsRepository.get(id);

    if (!portfolioAuthor) {
      return null;
    }

    const data = portfolioAuthor.toObject();

    if (data.avatar) {
      const imgLink = <FileLink>await this.documents.getImageFileLink({ id: data.avatar.id, path: data.avatar.url });
      Object.assign(data, { image: imgLink.url });
    }

    return data;
  }
}
