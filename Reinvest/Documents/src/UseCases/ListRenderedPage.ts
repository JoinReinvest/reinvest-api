import { UUID } from 'HKEKTypes/Generics';
import { DocumentsPdfPageRepository } from 'Reinvest/Documents/src/Adapter/Repository/DocumentsPdfPageRepository';

class ListRenderedPage {
  static getClassName = (): string => 'ListRenderedPage';
  private documentsPdfPageRepository: DocumentsPdfPageRepository;

  constructor(documentsPdfPageRepository: DocumentsPdfPageRepository) {
    this.documentsPdfPageRepository = documentsPdfPageRepository;
  }

  async execute(profileId: UUID) {
    const list = await this.documentsPdfPageRepository.getAllByProfileId(profileId);

    return list;
  }
}

export default ListRenderedPage;
