import { UUID } from 'HKEKTypes/Generics';
import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { LegalEntitiesService } from 'Registration/Adapter/Modules/LegalEntitiesService';
import { MappedType } from 'Registration/Domain/Model/Mapping/MappedType';

export class SynchronizeRegistryRecords {
  static getClassName = () => 'SynchronizeRegistryRecords';
  private legalEntitiesService: LegalEntitiesService;
  private mappingRegistryRepository: MappingRegistryRepository;

  constructor(mappingRegistryRepository: MappingRegistryRepository, legalEntitiesService: LegalEntitiesService) {
    this.legalEntitiesService = legalEntitiesService;
    this.mappingRegistryRepository = mappingRegistryRepository;
  }

  async execute(profileId: UUID): Promise<void> {
    try {
      console.log(`[START] Registry records synchronization for profile: ${profileId}`);
      const profileStructure = await this.legalEntitiesService.getProfileAccountStructure(profileId);
      await this.mappingRegistryRepository.addRecord(MappedType.PROFILE, profileId);

      for (const profileAccountStructure of profileStructure) {
        const { accountId, type } = profileAccountStructure;
        switch (type) {
          case 'INDIVIDUAL_ACCOUNT':
            await this.mappingRegistryRepository.addRecord(MappedType.INDIVIDUAL_ACCOUNT, profileId, accountId);
            break;
          case 'CORPORATE_ACCOUNT':
            await this.mappingRegistryRepository.addRecord(MappedType.CORPORATE_ACCOUNT, profileId, accountId);
            break;
          case 'TRUST_ACCOUNT':
            await this.mappingRegistryRepository.addRecord(MappedType.TRUST_ACCOUNT, profileId, accountId);
            break;
          case 'BENEFICIARY_ACCOUNT':
            await this.mappingRegistryRepository.addRecord(MappedType.BENEFICIARY_ACCOUNT, profileId, accountId);
            break;
          default:
            console.warn(`Unknown profile account type for profile ${profileId}`, type);
            break;
        }
      }

      console.log(`[FINISHED] Registry records synchronization for profile: ${profileId}`);
    } catch (error: any) {
      console.log(`[FAILED] Registry records synchronization for profile: ${profileId}`, error);
    }
  }
}
