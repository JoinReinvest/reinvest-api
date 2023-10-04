import { AccountType, Address, CompanyType, DocumentSchema, DomicileType, EmploymentStatusType } from 'Registration/Domain/Model/ReinvestTypes';

export type AccountNameOwner = {
  firstName: string;
  lastName: string;
  middleName?: string;
};

export type IndividualAccountForSynchronization = {
  accountId: string;
  address: Address;
  name: {
    firstName: string;
    lastName: string;
    middleName?: string;
  };
  profileId: string;
  employmentStatus?: EmploymentStatusType;
  industry?: string;
  nameOfEmployer?: string;
  netIncome?: string;
  netWorth?: string;
  title?: string;
  email?: string;
};

export type BeneficiaryAccountForSynchronization = {
  accountId: string;
  ownerName: {
    firstName: string;
    lastName: string;
    middleName?: string;
  };
  parentId: string;
  profileId: string;
};

export type StakeholderForSynchronization = {
  accountId: string;
  accountType: AccountType;
  address: Address;
  dateOfBirth: string;
  domicile: DomicileType;
  id: string;
  idScan: DocumentSchema[];
  name: {
    firstName: string;
    lastName: string;
    middleName?: string;
  };
  profileId: string;
  ssn: string | null;
};

export type CompanyForSynchronization = {
  accountId: string;
  accountType: AccountType;
  address: Address;
  companyDocuments: DocumentSchema[];
  companyName: {
    name: string;
  };
  companyType: { type: CompanyType };
  ein: string | null;
  profileId: string;
};

export type CompanyAccountForSynchronization = {
  accountId: string;
  address: Address;
  companyType: { type: CompanyType };
  ownerName: {
    firstName: string;
    lastName: string;
    middleName?: string;
  };
  profileId: string;
  stakeholders: { id: string }[];
};
