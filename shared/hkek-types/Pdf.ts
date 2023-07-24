import { UUID } from 'HKEKTypes/Generics';
import { TemplateContentType, Templates, TemplateVersion } from 'Templates/Types';

export enum PdfKinds {
  GeneratePdf = 'GeneratePdf',
  MakeScreenshotToPdf = 'MakeScreenshotToPdf',
}

export enum PdfEvents {
  PdfGenerated = 'PdfGenerated',
}

export type GeneratePdfCommand = {
  data: {
    catalog: string;
    content: TemplateContentType;
    fileId: UUID;
    fileName: string;
    profileId: UUID;
    template: Templates;
    version: TemplateVersion;
  };
  id: UUID;
  kind: PdfKinds.GeneratePdf;
};

export type MakeScreenshotToPdfCommand = {
  data: {
    catalog: string;
    fileId: UUID;
    fileName: string;
    profileId: UUID;
    url: string;
  };
  id: string;
  kind: PdfKinds.MakeScreenshotToPdf;
};

export type PdfGenerated = {
  data: {
    fileId: UUID;
    profileId: UUID;
  };
  id: UUID;
  kind: PdfEvents.PdfGenerated;
};
