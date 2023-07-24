import { UUID } from 'HKEKTypes/Generics';
import {
  NCAccountStructureMapping,
  RegistryQueryRepository,
  VertaloMappingConfiguration,
} from 'Registration/Adapter/Database/Repository/RegistryQueryRepository';
import { MappedRecordStatus, MappedType } from 'Registration/Domain/Model/Mapping/MappedType';

export type IdToNCId = {
  id: string;
  ncId: string;
  recordId: string;
  syncStatus: boolean;
};

export type NorthCapitalAccountStructure = {
  account: IdToNCId;
  profile: IdToNCId;
  type: 'INDIVIDUAL' | 'COMPANY';
  company?: IdToNCId;
  stakeholders?: IdToNCId[];
};

export type ObjectMapping = {
  accountId: string | null;
  partyId: string;
  profileId: string;
  stakeholderId: string | null;
  type: MappedType;
};

export type InvestorAccountEmail = {
  accountId: UUID;
  email: string;
};

export class RegistryQuery {
  private registryQueryRepository: RegistryQueryRepository;

  constructor(registryQueryRepository: RegistryQueryRepository) {
    this.registryQueryRepository = registryQueryRepository;
  }

  static getClassName = () => 'RegistryQuery';

  async getAccountMapping(accountId: string): Promise<{
    accountEmail: string;
    northCapitalAccountId: string | null;
  } | null> {
    const data = await this.registryQueryRepository.getAccountMapping(accountId);

    if (!data) {
      return null;
    }

    const { email, northCapitalId } = data;

    return {
      northCapitalAccountId: northCapitalId,
      accountEmail: email,
    };
  }

  async getVertaloConfigurationForAccount(profileId: string, accountId: string): Promise<VertaloMappingConfiguration | null> {
    return this.registryQueryRepository.getVertaloConfigurationForAccount(profileId, accountId);
  }

  async getNorthCapitalAccountStructure(profileId: string, accountId: string): Promise<NorthCapitalAccountStructure | null> {
    const accountMapping = await this.registryQueryRepository.getNorthCapitalAccountStructure(profileId, accountId);
    const accountStructure = this.mapAccountStructure(accountMapping, profileId);

    return this.isValidAccountStructure(accountStructure) ? accountStructure : null;
  }

  async getAccountStructureForSynchronization(profileId: string, accountId: string): Promise<NorthCapitalAccountStructure | null> {
    const accountMapping = await this.registryQueryRepository.getAccountStructureForSynchronization(profileId, accountId);

    return this.mapAccountStructure(accountMapping, profileId);
  }

  private mapAccountStructure(accountMapping: NCAccountStructureMapping[], profileId: string): NorthCapitalAccountStructure {
    const accountStructure = <NorthCapitalAccountStructure>{};
    accountMapping.map((record: NCAccountStructureMapping) => {
      if (record.mappedType === MappedType.PROFILE) {
        accountStructure.profile = {
          id: profileId,
          recordId: record.recordId,
          ncId: record.northCapitalId,
          syncStatus: record.status === MappedRecordStatus.CLEAN,
        };
      }

      if ([MappedType.INDIVIDUAL_ACCOUNT, MappedType.CORPORATE_ACCOUNT, MappedType.TRUST_ACCOUNT].includes(record.mappedType)) {
        accountStructure.account = {
          id: record.externalId,
          recordId: record.recordId,
          ncId: record.northCapitalId,
          syncStatus: record.status === MappedRecordStatus.CLEAN,
        };
        accountStructure.type = record.mappedType === MappedType.INDIVIDUAL_ACCOUNT ? 'INDIVIDUAL' : 'COMPANY';
      }

      if (record.mappedType === MappedType.COMPANY) {
        accountStructure.company = {
          id: record.externalId,
          recordId: record.recordId,
          ncId: record.northCapitalId,
          syncStatus: record.status === MappedRecordStatus.CLEAN,
        };
      }

      if (record.mappedType === MappedType.STAKEHOLDER) {
        accountStructure.stakeholders = accountStructure.stakeholders || [];
        accountStructure.stakeholders.push({
          id: record.dependentId,
          recordId: record.recordId,
          ncId: record.northCapitalId,
          syncStatus: record.status === MappedRecordStatus.CLEAN,
        });
      }
    });

    return accountStructure;
  }

  async getMappingByPartyId(partyId: string): Promise<ObjectMapping | null> {
    return this.registryQueryRepository.getMappingByPartyId(partyId);
  }

  async getInvestorEmails(accountIds: UUID[]): Promise<InvestorAccountEmail[]> {
    return this.registryQueryRepository.getInvestorEmails(accountIds);
  }

  private isValidAccountStructure(accountStructure: NorthCapitalAccountStructure): boolean {
    if (!accountStructure.profile || !accountStructure.account) {
      return false;
    }

    if (accountStructure.type === 'COMPANY' && !accountStructure.company) {
      return false;
    }

    return true;
  }
}
