import { UUID } from 'HKEKTypes/Generics';

export interface DocumentsRenderedPagePdfSchema {
  dateCreated: Date;
  dateGenerated: Date | null;
  id: UUID;
  name: string;
  profileId: UUID;
  url: string;
}

export interface CalculationsSchema {
  id: UUID;
  profileId: UUID;
  data: string;
}
