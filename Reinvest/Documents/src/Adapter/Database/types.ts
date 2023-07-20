import { UUID } from 'HKEKTypes/Generics';

export interface DocumentsRenderedPagePdfSchema {
  dateCreated: Date;
  dateGenerated: Date | null;
  id: UUID;
  name: string;
  profileId: UUID;
  url: string;
}

export interface DocumentsImageCacheSchema {
  bucketName: string;
  catalog: string;
  expirationDate: Date;
  fileName: string;
  id: UUID;
  url: string;
}
