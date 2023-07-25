import { VertaloMappingConfiguration } from 'Archiving/Domain/ArchivedBeneficiary';
import { UUID } from 'HKEKTypes/Generics';
import { Registration } from 'Registration/index';

export class RegistrationService {
  private registrationModule: Registration.Main;
  static getClassName = (): string => 'RegistrationService';

  constructor(registrationModule: Registration.Main) {
    this.registrationModule = registrationModule;
  }

  async getVertaloConfigurationForAccount(profileId: UUID, accountId: UUID): Promise<VertaloMappingConfiguration | null> {
    const api = this.registrationModule.api();

    return api.getVertaloConfigurationForAccount(profileId, accountId);
  }
}
