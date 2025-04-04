import { Kysely } from 'kysely';
import {
  LegalEntitiesBannedList,
  LegalEntitiesBeneficiaryTable,
  LegalEntitiesCompanyAccount,
  LegalEntitiesDraftAccount,
  LegalEntitiesIndividualAccount,
  LegalEntitiesProfile,
} from 'LegalEntities/Adapter/Database/LegalEntitiesSchema';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';

export const legalEntitiesProfileTable = 'legal_entities_profile';
export const legalEntitiesDraftAccountTable = 'legal_entities_draft_accounts';
export const legalEntitiesIndividualAccountTable = 'legal_entities_individual_account';
export const legalEntitiesCompanyAccountTable = 'legal_entities_company_account';
export const legalEntitiesBeneficiaryTable = 'legal_entities_beneficiary';
export const legalEntitiesBannedListTable = 'legal_entities_banned_list';

export interface LegalEntitiesDatabase {
  [legalEntitiesBannedListTable]: LegalEntitiesBannedList;
  [legalEntitiesBeneficiaryTable]: LegalEntitiesBeneficiaryTable;
  [legalEntitiesCompanyAccountTable]: LegalEntitiesCompanyAccount;
  [legalEntitiesDraftAccountTable]: LegalEntitiesDraftAccount;
  [legalEntitiesIndividualAccountTable]: LegalEntitiesIndividualAccount;
  [legalEntitiesProfileTable]: LegalEntitiesProfile;
}

export const LegalEntitiesDatabaseAdapterInstanceProvider = 'LegalEntitiesDatabaseAdapterProvider';
export type LegalEntitiesDatabaseAdapter = Kysely<LegalEntitiesDatabase>;
export type LegalEntitiesDatabaseAdapterProvider = DatabaseProvider<LegalEntitiesDatabase>;

export function createLegalEntitiesDatabaseAdapterProvider(config: PostgreSQLConfig): LegalEntitiesDatabaseAdapterProvider {
  return new DatabaseProvider<LegalEntitiesDatabase>(config);
}
