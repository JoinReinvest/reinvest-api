import { UUID } from 'HKEKTypes/Generics';
import { LegalEntities } from 'LegalEntities/index';

export class LegalEntitiesService {
  private legalEntitiesModule: LegalEntities.Main;
  static getClassName = (): string => 'LegalEntitiesService';

  constructor(legalEntitiesModule: LegalEntities.Main) {
    this.legalEntitiesModule = legalEntitiesModule;
  }

  async getBeneficiary(
    profileId: UUID,
    accountId: UUID,
  ): Promise<{
    label: string;
    parentId: UUID;
  } | null> {
    const api = this.legalEntitiesModule.api();
    const beneficiary = await api.readBeneficiaryAccount(profileId, accountId);

    if (!beneficiary) {
      return null;
    }

    return {
      label: beneficiary!.label!,
      parentId: beneficiary!.parentId!,
    };
  }

  async archiveBeneficiary(profileId: UUID, accountId: UUID): Promise<boolean> {
    const api = this.legalEntitiesModule.api();

    return api.archiveBeneficiary(profileId, accountId);
  }
}
