import {LegalEntities} from "LegalEntities/index";
import {ContainerInterface} from "Container/Container";
import {CompleteProfileController} from "LegalEntities/Port/Api/CompleteProfileController";
import {DraftAccountsController} from "LegalEntities/Port/Api/DraftAccountsController";
import {ProfileRepository} from "LegalEntities/Adapter/Database/Repository/ProfileRepository";
import {GetProfileController} from "LegalEntities/Port/Api/GetProfileController";
import {DocumentsService} from "LegalEntities/Adapter/Modules/DocumentsService";
import {CreateDraftAccount} from "LegalEntities/UseCases/CreateDraftAccount";
import {CompleteDraftAccount} from "LegalEntities/UseCases/CompleteDraftAccount";
import {DraftAccountQuery} from "LegalEntities/Port/Api/DraftAccountQuery";
import {ReadAccountController} from "LegalEntities/Port/Api/ReadAccountController";
import {TransformDraftAccountIntoRegularAccount} from "LegalEntities/UseCases/TransformDraftAccountIntoRegularAccount";
import {AccountRepository} from "LegalEntities/Adapter/Database/Repository/AccountRepository";
import {RemoveDraftAccount} from "LegalEntities/UseCases/RemoveDraftAccount";
import {CompleteProfile} from "LegalEntities/UseCases/CompleteProfile";
import {SimpleEventBus} from "SimpleAggregator/EventBus/EventBus";
import {AvatarQuery} from "LegalEntities/Port/Api/AvatarQuery";
import {DraftAccountRepository} from "LegalEntities/Adapter/Database/Repository/DraftAccountRepository";


export class PortsProvider {
    private config: LegalEntities.Config;

    constructor(config: LegalEntities.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        // query
        container
            .addSingleton(AvatarQuery, [DocumentsService])
            .addSingleton(DraftAccountQuery, [DraftAccountRepository, AvatarQuery])
        ;
        //controllers
        container
            .addSingleton(CompleteProfileController, [CompleteProfile])
            .addSingleton(GetProfileController, [ProfileRepository])
            .addSingleton(ReadAccountController, [AccountRepository, AvatarQuery])
            .addSingleton(DraftAccountsController, [CreateDraftAccount, CompleteDraftAccount, DraftAccountQuery, TransformDraftAccountIntoRegularAccount, RemoveDraftAccount])
        ;
    }
}
