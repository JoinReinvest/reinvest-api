import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { VerifyAccount } from 'Verification/IntegrationLogic/UseCase/VerifyAccount';

export class NorthCapitalVerificationEvents {
  constructor(registrationService: RegistrationService, verifyAccountUseCase: VerifyAccount) {
    this.registrationService = registrationService;
    this.verifyAccountUseCase = verifyAccountUseCase;
  }

  static getClassName = () => 'NorthCapitalVerificationEvents';
  private registrationService: RegistrationService;
  private verifyAccountUseCase: VerifyAccount;

  async handleNorthCapitalVerificationEvent(partyId: string): Promise<void> {
    const partyMapping = await this.registrationService.getMappingByPartyId(partyId);

    if (!partyMapping) {
      return;
    }

    const { accountId, profileId } = partyMapping;

    if (accountId) {
      await this.verifyAccountUseCase.verify(profileId, accountId);
    }
  }
}
