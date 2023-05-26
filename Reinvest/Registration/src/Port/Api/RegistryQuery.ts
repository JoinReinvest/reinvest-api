import { NCAccountStructureMapping, RegistryQueryRepository } from 'Registration/Adapter/Database/Repository/RegistryQueryRepository';
import { MappedRecordStatus, MappedType } from 'Registration/Domain/Model/Mapping/MappedType';

export type IdToNCId = {
  id: string;
  ncId: string;
  syncStatus: boolean;
};

export type NorthCapitalAccountStructure = {
  account: IdToNCId;
  profile: IdToNCId;
  type: 'INDIVIDUAL' | 'COMPANY';
  company?: IdToNCId;
  stakeholders?: IdToNCId[];
};

export class RegistryQuery {
  private registryQueryRepository: RegistryQueryRepository;

  constructor(registryQueryRepository: RegistryQueryRepository) {
    this.registryQueryRepository = registryQueryRepository;
  }

  static getClassName = () => 'RegistryQuery';

  async getAccountMapping(accountId: string): Promise<{ accountEmail: string; northCapitalAccountId: string } | null> {
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

  async getNorthCapitalAccountStructure(profileId: string, accountId: string): Promise<NorthCapitalAccountStructure | null> {
    const accountMapping = await this.registryQueryRepository.getNorthCapitalAccountStructure(profileId, accountId);
    const accountStructure = <NorthCapitalAccountStructure>{};

    accountMapping.map((record: NCAccountStructureMapping) => {
      if (record.mappedType === MappedType.PROFILE) {
        accountStructure.profile = {
          id: profileId,
          ncId: record.northCapitalId,
          syncStatus: record.status === MappedRecordStatus.CLEAN,
        };
      }

      if ([MappedType.INDIVIDUAL_ACCOUNT, MappedType.CORPORATE_ACCOUNT, MappedType.TRUST_ACCOUNT].includes(record.mappedType)) {
        accountStructure.account = {
          id: record.externalId,
          ncId: record.northCapitalId,
          syncStatus: record.status === MappedRecordStatus.CLEAN,
        };
        accountStructure.type = record.mappedType === MappedType.INDIVIDUAL_ACCOUNT ? 'INDIVIDUAL' : 'COMPANY';
      }

      if (record.mappedType === MappedType.COMPANY) {
        accountStructure.company = {
          id: record.externalId,
          ncId: record.northCapitalId,
          syncStatus: record.status === MappedRecordStatus.CLEAN,
        };
      }

      if (record.mappedType === MappedType.STAKEHOLDER) {
        accountStructure.stakeholders = accountStructure.stakeholders || [];
        accountStructure.stakeholders.push({
          id: record.dependentId,
          ncId: record.northCapitalId,
          syncStatus: record.status === MappedRecordStatus.CLEAN,
        });
      }
    });

    return this.isValidAccountStructure(accountStructure) ? accountStructure : null;
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
