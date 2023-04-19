export enum DomicileType {
  CITIZEN = 'CITIZEN',
  RESIDENT = 'RESIDENT',
  GREEN_CARD = 'GREEN_CARD',
  VISA = 'VISA',
}

export enum EmploymentStatusType {
  EMPLOYED = 'EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED',
  RETIRED = 'RETIRED',
  STUDENT = 'STUDENT',
}

export type Address = {
  addressLine1: string;
  city: string;
  country: string;
  state: string;
  zip: string;
  addressLine2?: string;
};

export type DocumentSchema = {
  fileName: string;
  id: string;
  path: string;
};

export enum AccountType {
  CORPORATE = 'CORPORATE',
  TRUST = 'TRUST',
}

export enum CompanyType {
  PARTNERSHIP = 'PARTNERSHIP',
  LLC = 'LLC',
  CORPORATION = 'CORPORATION',
  REVOCABLE = 'REVOCABLE',
  IRREVOCABLE = 'IRREVOCABLE',
}
