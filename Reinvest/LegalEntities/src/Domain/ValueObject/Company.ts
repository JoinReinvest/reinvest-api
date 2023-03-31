export enum CorporateType {
    PARTNERSHIP = 'PARTNERSHIP',
    LLC = 'LLC',
    CORPORATION = 'CORPORATION'
}

export enum TrustType {
    REVOCABLE = 'REVOCABLE',
    IRREVOCABLE = 'IRREVOCABLE'
}

export type CompanyType = TrustType | CorporateType;