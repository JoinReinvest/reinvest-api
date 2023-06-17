export type Template = {
  paragraphs: {
    lines: string[];
    isCheckedOption?: boolean;
  }[];
  header?: string;
}[];

export enum PdfTypes {
  AGREEMENT = "AGREEMENT",
}
