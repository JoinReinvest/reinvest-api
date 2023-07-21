import { PortfolioUpdatesRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioUpdatesRepository';
import { PortfolioAuthorsRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioAuthors';
import { FileLink } from 'Documents/Adapter/S3/FileLinkService';
import { DocumentsService } from 'Portfolio/Adapter/Documents/DocumentsService';
import {PortfolioRepository} from "Portfolio/Adapter/Database/Repository/PortfolioRepository";

export class GetPortfolioUpdates {
  private portfolioUpdatesRepository: PortfolioUpdatesRepository;
  private portfolioAuthorsRepository: PortfolioAuthorsRepository;
  private portfolioRepository: PortfolioRepository;
  private documents: DocumentsService;

  constructor(portfolioUpdatesRepository: PortfolioUpdatesRepository, portfolioAuthorsRepository: PortfolioAuthorsRepository, documents: DocumentsService, portfolioRepository: PortfolioRepository) {
    this.portfolioUpdatesRepository = portfolioUpdatesRepository;
    this.portfolioAuthorsRepository = portfolioAuthorsRepository;
    this.portfolioRepository = portfolioRepository;
    this.documents = documents;
  }

  public static getClassName = (): string => 'GetPortfolioUpdates';

  public async execute() {
    const portfolioUpdates = await this.portfolioUpdatesRepository.getAll();
    const activePortfolio = await this.portfolioRepository.getActivePortfolio();
    const portfolioUpdatesData = [];

    if (!activePortfolio) {
      throw new Error('Active portfolio does not exist');
    }

    if (!portfolioUpdates || portfolioUpdates.length === 0) {
      return [];
    }

    const activePortfolioData = activePortfolio.toObject();

    for (const update of portfolioUpdates) {
      const { portfolioAuthorId, ...data } = update.toObject();
      const { image } = data;

      if (image) {
        const imgLink = <FileLink>await this.documents.getImageFileLink({ id: image.id, path: activePortfolioData.id });
        Object.assign(data.image, { url: imgLink.url, id: image.id });
      }

      const author = await this.portfolioAuthorsRepository.get(portfolioAuthorId);

      if (!author) {
        portfolioUpdatesData.push({ ...data, author: null });
      } else {
        const avatarData = author.toObject();
        const avatarInitials = this.getAuthorInitials(avatarData.name);

        Object.assign(avatarData.avatar, { initials: avatarInitials });

        if (avatarData.avatar) {
          const imgLink = <FileLink>await this.documents.getImageFileLink({ id: avatarData.avatar.id, path: "authors" });
          Object.assign(avatarData.avatar, { url: imgLink.url, id: avatarData.avatar.id });
        }

        portfolioUpdatesData.push({ ...data, author: avatarData });
      }
    }

    return portfolioUpdatesData;
  }

  private getAuthorInitials(name: string): string {
    const nameParts = name.split(' ');
    const initials = nameParts.map((part) => part.charAt(0));

    return initials.join('');
  }
}
