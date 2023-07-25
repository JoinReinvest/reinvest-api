import { ContainerInterface } from 'Container/Container';
import { CalculationsRepository } from 'Documents/Adapter/Repository/CalculationsRepository'
import { S3Adapter } from 'Documents/Adapter/S3/S3Adapter';
import { Documents } from 'Documents/index';
import AddCalculation from 'Documents/UseCases/AddCalculation'
import GetCalculation from 'Documents/UseCases/GetCalculation'
import GetRenderedPageLink from 'Documents/UseCases/GetRenderedPageLink';
import ListRenderedPage from 'Documents/UseCases/ListRenderedPage';
import RenderPageToPdf from 'Documents/UseCases/RenderPageToPdf';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { DocumentsPdfPageRepository } from 'Reinvest/Documents/src/Adapter/Repository/DocumentsPdfPageRepository';

export class UseCaseProvider {
  private config: Documents.Config;

  constructor(config: Documents.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);
    container.addSingleton(RenderPageToPdf, [DocumentsPdfPageRepository, IdGenerator]);
    container.addSingleton(GetRenderedPageLink, [S3Adapter]);
    container.addSingleton(ListRenderedPage, [DocumentsPdfPageRepository]);
    container.addSingleton(AddCalculation, [CalculationsRepository]);
    container.addSingleton(GetCalculation, [CalculationsRepository]);
  }
}
