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
import {TransformDraftAccountIntoRegularAccount} from "LegalEntities/UseCases/TransformDraftAccountIntoRegularAccount";
import {RemoveDraftAccount} from "LegalEntities/UseCases/RemoveDraftAccount";

export class PortsProvider {
    private config: LegalEntities.Config;

    constructor(config: LegalEntities.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        //controllers
        container
            .addClass(CompleteProfileController, [ProfileRepository])
            .addClass(GetProfileController, [ProfileRepository, DocumentsService])
            .addClass(DraftAccountsController, [CreateDraftAccount, CompleteDraftAccount, DraftAccountQuery, TransformDraftAccountIntoRegularAccount, RemoveDraftAccount])
        ;
    }
}
