import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { BeneficiaryRepository } from 'LegalEntities/Adapter/Database/Repository/BeneficiaryRepository';
import { DraftAccountRepository } from 'LegalEntities/Adapter/Database/Repository/DraftAccountRepository';
import { ProfileRepository } from 'LegalEntities/Adapter/Database/Repository/ProfileRepository';
import { DocumentsService } from 'LegalEntities/Adapter/Modules/DocumentsService';
import { InvestmentAccountsService } from 'LegalEntities/Adapter/Modules/InvestmentAccountsService';
import { LegalEntities } from 'LegalEntities/index';
import { AvatarQuery } from 'LegalEntities/Port/Api/AvatarQuery';
import { BeneficiaryAccountController } from 'LegalEntities/Port/Api/BeneficiaryAccountController';
import { CompleteProfileController } from 'LegalEntities/Port/Api/CompleteProfileController';
import { DraftAccountQuery } from 'LegalEntities/Port/Api/DraftAccountQuery';
import { DraftAccountsController } from 'LegalEntities/Port/Api/DraftAccountsController';
import { GetProfileController } from 'LegalEntities/Port/Api/GetProfileController';
import { ReadAccountController } from 'LegalEntities/Port/Api/ReadAccountController';
import { UpdateForVerificationController } from 'LegalEntities/Port/Api/UpdateForVerificationController';
import { UpdateProfileController } from 'LegalEntities/Port/Api/UpdateProfileController';
import { CompleteDraftAccount } from 'LegalEntities/UseCases/CompleteDraftAccount';
import { CompleteProfile } from 'LegalEntities/UseCases/CompleteProfile';
import { CreateDraftAccount } from 'LegalEntities/UseCases/CreateDraftAccount';
import { RemoveDraftAccount } from 'LegalEntities/UseCases/RemoveDraftAccount';
import { TransformDraftAccountIntoRegularAccount } from 'LegalEntities/UseCases/TransformDraftAccountIntoRegularAccount';
import { UpdateCompanyForVerification } from 'LegalEntities/UseCases/UpdateCompanyForVerification';
import { UpdateProfile } from 'LegalEntities/UseCases/UpdateProfile';
import { UpdateProfileForVerification } from 'LegalEntities/UseCases/UpdateProfileForVerification';
import { UpdateStakeholderForVerification } from 'LegalEntities/UseCases/UpdateStakeholderForVerification';

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
      .addSingleton(UpdateProfileController, [UpdateProfile])
      .addSingleton(ReadAccountController, [AccountRepository, AvatarQuery, BeneficiaryRepository])
      .addSingleton(BeneficiaryAccountController, [IdGenerator, BeneficiaryRepository, InvestmentAccountsService, 'LegalEntitiesTransactionalAdapter'])
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
