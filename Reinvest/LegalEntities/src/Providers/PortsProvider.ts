import {LegalEntities} from "LegalEntities/index";
import {ContainerInterface} from "Container/Container";
import {CompleteProfileController} from "LegalEntities/Port/Api/CompleteProfileController";
import {DraftAccountsController} from "LegalEntities/Port/Api/DraftAccountsController";
import {ProfileRepository} from "LegalEntities/Adapter/Database/Repository/ProfileRepository";
import {GetProfileController} from "LegalEntities/Port/Api/GetProfileController";
import {DocumentsService} from "LegalEntities/Adapter/Modules/DocumentsService";
import {CreateDraftAccount} from "LegalEntities/UseCases/CreateDraftAccount";
import {CompleteDraftAccount} from "LegalEntities/UseCases/CompleteDraftAccount";
import {DraftAccountQuery} from "LegalEntities/UseCases/DraftAccountQuery";
import {ReadAccountController} from "LegalEntities/Port/Api/ReadAccountController";
import {TransformDraftAccountIntoRegularAccount} from "LegalEntities/UseCases/TransformDraftAccountIntoRegularAccount";
import {AccountRepository} from "LegalEntities/Adapter/Database/Repository/AccountRepository";
import {RemoveDraftAccount} from "LegalEntities/UseCases/RemoveDraftAccount";


export class PortsProvider {
    private config: LegalEntities.Config;

    constructor(config: LegalEntities.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        //controllers
        container
            .addSingleton(CompleteProfileController, [ProfileRepository])
            .addSingleton(GetProfileController, [ProfileRepository])
            .addSingleton(ReadAccountController, [AccountRepository, DocumentsService])
            .addSingleton(DraftAccountsController, [CreateDraftAccount, CompleteDraftAccount, DraftAccountQuery, TransformDraftAccountIntoRegularAccount, RemoveDraftAccount])
        ;
    }
}
