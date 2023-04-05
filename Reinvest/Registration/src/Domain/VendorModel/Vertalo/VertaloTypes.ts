export type VertaloIndividualAccountStructure = {
    email: string;
    name: string;
}

export enum VertaloEntityType {
    ACCOUNT = 'ACCOUNT',
}

export type InvestorVertaloIds = {
    customerId: string,
    investorId: string
}

export type VertaloIds = InvestorVertaloIds;

export type VertaloSynchronizationRecordType = {
    recordId: string;
    vertaloIds: VertaloIds;
    type: VertaloEntityType;
    crc: string;
    documents: string | null;
    version: number;
}