import { ContainerInterface } from 'Container/Container';
import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { DraftAccountRepository } from 'LegalEntities/Adapter/Database/Repository/DraftAccountRepository';
import { ProfileRepository } from 'LegalEntities/Adapter/Database/Repository/ProfileRepository';
import { DocumentsService } from 'LegalEntities/Adapter/Modules/DocumentsService';
import { LegalEntities } from 'LegalEntities/index';
import { AvatarQuery } from 'LegalEntities/Port/Api/AvatarQuery';
import { CompleteProfileController } from 'LegalEntities/Port/Api/CompleteProfileController';
import { DraftAccountQuery } from 'LegalEntities/Port/Api/DraftAccountQuery';
import { DraftAccountsController } from 'LegalEntities/Port/Api/DraftAccountsController';
import { GetProfileController } from 'LegalEntities/Port/Api/GetProfileController';
import { ReadAccountController } from 'LegalEntities/Port/Api/ReadAccountController';
import { CompleteDraftAccount } from 'LegalEntities/UseCases/CompleteDraftAccount';
import { CompleteProfile } from 'LegalEntities/UseCases/CompleteProfile';
import { CreateDraftAccount } from 'LegalEntities/UseCases/CreateDraftAccount';
import { RemoveDraftAccount } from 'LegalEntities/UseCases/RemoveDraftAccount';
import { TransformDraftAccountIntoRegularAccount } from 'LegalEntities/UseCases/TransformDraftAccountIntoRegularAccount';

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
      .addSingleton(ReadAccountController, [AccountRepository, AvatarQuery])
      .addSingleton(DraftAccountsController, [
        CreateDraftAccount,
        CompleteDraftAccount,
        DraftAccountQuery,
        TransformDraftAccountIntoRegularAccount,
        RemoveDraftAccount,
      ]);
  }
}
