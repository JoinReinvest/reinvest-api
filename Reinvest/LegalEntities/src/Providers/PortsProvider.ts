import { ContainerInterface } from 'Container/Container';
import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { ProfileRepository } from 'LegalEntities/Adapter/Database/Repository/ProfileRepository';
import { DocumentsService } from 'LegalEntities/Adapter/Modules/DocumentsService';
import { LegalEntities } from 'LegalEntities/index';
import { CompleteProfileController } from 'LegalEntities/Port/Api/CompleteProfileController';
import { DraftAccountsController } from 'LegalEntities/Port/Api/DraftAccountsController';
import { GetProfileController } from 'LegalEntities/Port/Api/GetProfileController';
import { ReadAccountController } from 'LegalEntities/Port/Api/ReadAccountController';
import { CompleteDraftAccount } from 'LegalEntities/UseCases/CompleteDraftAccount';
import { CompleteProfile } from 'LegalEntities/UseCases/CompleteProfile';
import { CreateDraftAccount } from 'LegalEntities/UseCases/CreateDraftAccount';
import { DraftAccountQuery } from 'LegalEntities/UseCases/DraftAccountQuery';
import { RemoveDraftAccount } from 'LegalEntities/UseCases/RemoveDraftAccount';
import { TransformDraftAccountIntoRegularAccount } from 'LegalEntities/UseCases/TransformDraftAccountIntoRegularAccount';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

export class PortsProvider {
  private config: LegalEntities.Config;

  constructor(config: LegalEntities.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    //controllers
    container
      .addSingleton(CompleteProfileController, [CompleteProfile])
      .addSingleton(GetProfileController, [ProfileRepository])
      .addSingleton(ReadAccountController, [AccountRepository, DocumentsService])
      .addSingleton(DraftAccountsController, [
        CreateDraftAccount,
        CompleteDraftAccount,
        DraftAccountQuery,
        TransformDraftAccountIntoRegularAccount,
        RemoveDraftAccount,
      ]);
  }
}
