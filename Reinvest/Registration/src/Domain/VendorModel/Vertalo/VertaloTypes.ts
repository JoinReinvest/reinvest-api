export type VertaloIndividualAccountStructure = {
  email: string;
  name: string;
};

export enum VertaloEntityType {
  ACCOUNT = 'ACCOUNT',
}

export type InvestorVertaloIds = {
  customerId: string;
  investorId: string;
};

export type VertaloIds = InvestorVertaloIds;

export type VertaloSynchronizationRecordType = {
  crc: string;
  documents: string | null;
  recordId: string;
  type: VertaloEntityType;
  version: number;
  vertaloIds: VertaloIds;
};
