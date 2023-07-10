import { ContainerInterface } from 'Container/Container';
import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { BeneficiaryRepository } from 'LegalEntities/Adapter/Database/Repository/BeneficiaryRepository';
import { DraftAccountRepository } from 'LegalEntities/Adapter/Database/Repository/DraftAccountRepository';
import { ProfileRepository } from 'LegalEntities/Adapter/Database/Repository/ProfileRepository';
import { DocumentsService } from 'LegalEntities/Adapter/Modules/DocumentsService';
import { IdentityService } from 'LegalEntities/Adapter/Modules/IdentityService';
import { LegalEntities } from 'LegalEntities/index';
import { AvatarQuery } from 'LegalEntities/Port/Api/AvatarQuery';
import { BeneficiaryAccountController } from 'LegalEntities/Port/Api/BeneficiaryAccountController';
import { CompleteProfileController } from 'LegalEntities/Port/Api/CompleteProfileController';
import { DraftAccountQuery } from 'LegalEntities/Port/Api/DraftAccountQuery';
import { DraftAccountsController } from 'LegalEntities/Port/Api/DraftAccountsController';
import { GetProfileController } from 'LegalEntities/Port/Api/GetProfileController';
import { ReadAccountController } from 'LegalEntities/Port/Api/ReadAccountController';
import { SubscriptionAgreementDataController } from 'LegalEntities/Port/Api/SubscriptionAgreementDataController';
import { UpdateAccountsController } from 'LegalEntities/Port/Api/UpdateAccountsController';
import { UpdateForVerificationController } from 'LegalEntities/Port/Api/UpdateForVerificationController';
import { UpdateProfileController } from 'LegalEntities/Port/Api/UpdateProfileController';
import { ArchiveBeneficiary } from 'LegalEntities/UseCases/ArchiveBeneficiary';
import { CompleteDraftAccount } from 'LegalEntities/UseCases/CompleteDraftAccount';
import { CompleteProfile } from 'LegalEntities/UseCases/CompleteProfile';
import { CreateDraftAccount } from 'LegalEntities/UseCases/CreateDraftAccount';
import { OpenBeneficiary } from 'LegalEntities/UseCases/OpenBeneficiary';
import { RemoveDraftAccount } from 'LegalEntities/UseCases/RemoveDraftAccount';
import { TransformDraftAccountIntoRegularAccount } from 'LegalEntities/UseCases/TransformDraftAccountIntoRegularAccount';
import { UpdateBeneficiaryAccount } from 'LegalEntities/UseCases/UpdateBeneficiaryAccount';
import { UpdateCompanyForVerification } from 'LegalEntities/UseCases/UpdateCompanyForVerification';
import { UpdateCorporateAccount } from 'LegalEntities/UseCases/UpdateCorporateAccount';
import { UpdateIndividualAccount } from 'LegalEntities/UseCases/UpdateIndividualAccount';
import { UpdateProfile } from 'LegalEntities/UseCases/UpdateProfile';
import { UpdateProfileForVerification } from 'LegalEntities/UseCases/UpdateProfileForVerification';
import { UpdateStakeholderForVerification } from 'LegalEntities/UseCases/UpdateStakeholderForVerification';
import { UpdateTrustAccount } from 'LegalEntities/UseCases/UpdateTrustAccount';

export class PortsProvider {
  private config: LegalEntities.Config;

  constructor(config: LegalEntities.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // query
    container.addSingleton(AvatarQuery, [DocumentsService]).addSingleton(DraftAccountQuery, [DraftAccountRepository, AvatarQuery]);
    //controllers
    container
      .addSingleton(CompleteProfileController, [CompleteProfile])
      .addSingleton(GetProfileController, [ProfileRepository])
      .addSingleton(UpdateAccountsController, [UpdateIndividualAccount, UpdateCorporateAccount, UpdateTrustAccount, UpdateBeneficiaryAccount])
      .addSingleton(UpdateProfileController, [UpdateProfile])
      .addSingleton(ReadAccountController, [AccountRepository, AvatarQuery, BeneficiaryRepository])
      .addSingleton(BeneficiaryAccountController, [OpenBeneficiary, ArchiveBeneficiary])
      .addSingleton(SubscriptionAgreementDataController, [AccountRepository, ProfileRepository, IdentityService, BeneficiaryRepository])
      .addSingleton(DraftAccountsController, [
        CreateDraftAccount,
        CompleteDraftAccount,
        DraftAccountQuery,
        TransformDraftAccountIntoRegularAccount,
        RemoveDraftAccount,
      ])
      .addSingleton(UpdateForVerificationController, [UpdateProfileForVerification, UpdateCompanyForVerification, UpdateStakeholderForVerification]);
  }
}
