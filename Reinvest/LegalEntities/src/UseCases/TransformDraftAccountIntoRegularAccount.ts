import {DraftAccountRepository} from "LegalEntities/Adapter/Database/Repository/DraftAccountRepository";
import {InvestmentAccountsService} from "LegalEntities/Adapter/Modules/InvestmentAccountsService";
import {AccountType} from "LegalEntities/Domain/AccountType";

export class TransformDraftAccountIntoRegularAccount {
    public static getClassName = (): string => "TransformDraftAccountIntoRegularAccount";
    private draftAccountRepository: DraftAccountRepository;
    private investmentAccountService: InvestmentAccountsService;

    constructor(draftAccountRepository: DraftAccountRepository, investmentAccountService: InvestmentAccountsService) {
        this.draftAccountRepository = draftAccountRepository;
        this.investmentAccountService = investmentAccountService;
    }

    async execute(profileId: string, draftAccountId: string): Promise<string[]> {
        // todo Transform draft into an account
        // todo remove Draft account
        const accountOpened = await this.investmentAccountService.openAccount(profileId, draftAccountId, AccountType.INDIVIDUAL);
        console.log({accountOpened});
        return [];
        // const activeDrafts = await this.draftAccountRepository.getActiveDraftsOfType(type, profileId);
        // if (activeDrafts.length > 0) {
        //     throw new Error('Draft account already exist');
        // }
        //
        // const draftId = (new IdGenerator()).createUuid();
        // const draft = DraftAccount.create({
        //     profileId,
        //     draftId,
        //     state: DraftAccountState.ACTIVE,
        //     accountType: type,
        //     data: null
        // });
        // const status = await this.draftAccountRepository.storeDraft(draft);
        //
        // if (!status) {
        //     throw new Error('Cannot create draft account');
        // }
        //
        // return draftId;
    }
}