import { UUID } from 'HKEKTypes/Generics';

export interface DocumentsRenderedPagePdfSchema {
  dateCreated: Date;
  id: UUID;
  name: string;
  profileId: UUID;
  url: string;
}
