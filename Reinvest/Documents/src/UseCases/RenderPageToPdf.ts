import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DocumentsPdfPageRepository } from 'Reinvest/Documents/src/Adapter/Repository/DocumentsPdfPageRepository';
import { DomainEvent } from 'SimpleAggregator/Types';
import { DateTime } from 'Money/DateTime';

export enum PdfTypes {
  PAGE = 'PAGE',
}

export type RenderPageToPdfCreate = {
  dateCreated: Date;
  id: UUID;
  name: string;
  profileId: UUID;
  url: string;
};

class RenderPageToPdf {
  static getClassName = (): string => 'RenderPageToPdf';
  private documentsPdfPageRepository: DocumentsPdfPageRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(documentsPdfPageRepository: DocumentsPdfPageRepository, idGenerator: IdGeneratorInterface) {
    this.documentsPdfPageRepository = documentsPdfPageRepository;
    this.idGenerator = idGenerator;
  }

  async execute(profileId: UUID, name: string, url: string) {
    const events: DomainEvent[] = [];

    const id = this.idGenerator.createUuid();
    const renderedPage: RenderPageToPdfCreate = {
      id,
      profileId,
      name,
      url,
      dateCreated: DateTime.now().toDate(),
    };

    await this.documentsPdfPageRepository.create(renderedPage);

    const pdfCommand: DomainEvent = {
      id,
      kind: 'MakeScreenshotToPdf',
      data: {
        catalog: `${profileId}/calculations`,
        fileName: id,
        name,
        url,
        templateType: PdfTypes.PAGE,
      },
    };

    events.push(pdfCommand);

    await this.documentsPdfPageRepository.publishEvents(events);

    return id;
  }
}

export default RenderPageToPdf;
