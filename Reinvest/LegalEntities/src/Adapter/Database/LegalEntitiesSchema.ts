import { Insertable } from 'kysely';

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

export const LegalEntitiesJsonFields = ['name', 'dateOfBirth', 'address', 'idScan', 'domicile', 'statements', 'investingExperience', 'ssnObject'];

export type InsertableProfile = Insertable<LegalEntitiesProfile>;
export type InsertableDraftAccount = Insertable<LegalEntitiesDraftAccount>;
