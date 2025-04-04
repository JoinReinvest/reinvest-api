import { JSONObjectOf } from 'HKEKTypes/Generics';
import { BeneficiaryName } from 'LegalEntities/Domain/Accounts/BeneficiaryAccount';
import { BannedType } from 'LegalEntities/Domain/BannedEntity';
import { AvatarInput } from 'LegalEntities/Domain/ValueObject/Document';

export interface LegalEntitiesProfile {
  address: string | null;
  dateOfBirth: string | null;
  domicile: string | null;
  externalId: string;
  idScan: string | null;
  investingExperience: string | null;
  isCompleted: boolean;
  label: string;
  name: string | null;
  profileId: string;
  ssn: string | null;
  ssnObject: string | null;
  statements: string | null;
}

export interface LegalEntitiesBannedList {
  accountId: string | null;
  anonymizedSensitiveNumber: string;
  dateCancelled: Date | null;
  dateCreated: Date;
  id: string;
  profileId: string;
  reasons: string;
  sensitiveNumber: string;
  stakeholderId: string | null;
  status: 'ACTIVE' | 'CANCELLED';
  type: BannedType;
}

export interface LegalEntitiesDraftAccount {
  accountType: string;
  data: string | null;
  draftId: string;
  profileId: string;
  state: string;
}

export interface LegalEntitiesIndividualAccount {
  accountId: string;
  avatar: string | null;
  employer: string | null;
  employmentStatus: string | null;
  netIncome: string | null;
  netWorth: string | null;
  profileId: string;
}

export interface LegalEntitiesCompanyAccount {
  accountId: string;
  accountType: string;
  address: string | null;
  annualRevenue: string | null;
  avatar: string | null;
  companyDocuments: string | null;
  companyName: string | null;
  companyType: string | null;
  ein: string | null;
  einHash: string;
  industry: string | null;
  initialsValue: number;
  numberOfEmployees: string | null;
  profileId: string;
  stakeholders: string | null;
}

export interface LegalEntitiesBeneficiaryTable {
  accountId: string;
  avatarJson: JSONObjectOf<AvatarInput> | null;
  individualId: string;
  isArchived: boolean;
  label: string;
  nameJson: JSONObjectOf<BeneficiaryName>;
  profileId: string;
  dateCreated?: Date;
}

export const LegalEntitiesJsonFields = ['name', 'dateOfBirth', 'address', 'idScan', 'domicile', 'statements', 'investingExperience', 'ssnObject'];
