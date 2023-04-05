import {DraftAccountRepository} from "LegalEntities/Adapter/Database/Repository/DraftAccountRepository";
import {InvestmentAccountsService} from "LegalEntities/Adapter/Modules/InvestmentAccountsService";
import {AccountType} from "LegalEntities/Domain/AccountType";
import {
    CompanyDraftAccount,
    CorporateDraftAccount,
    DraftAccount,
    IndividualDraftAccount, TrustDraftAccount
} from "LegalEntities/Domain/DraftAccount/DraftAccount";
import {AccountRepository} from "LegalEntities/Adapter/Database/Repository/AccountRepository";
import {TransactionalAdapter} from "PostgreSQL/TransactionalAdapter";
import {LegalEntitiesDatabase} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {IndividualAccount} from "LegalEntities/Domain/Accounts/IndividualAccount";
import {CompanyAccount} from "LegalEntities/Domain/Accounts/CompanyAccount";

export class TransformDraftAccountIntoRegularAccount {
    public static getClassName = (): string => "TransformDraftAccountIntoRegularAccount";
    private draftAccountRepository: DraftAccountRepository;
    private investmentAccountService: InvestmentAccountsService;
    private accountRepository: AccountRepository;
    private transactionAdapter: TransactionalAdapter<LegalEntitiesDatabase>;

    constructor(
        draftAccountRepository: DraftAccountRepository,
        investmentAccountService: InvestmentAccountsService,
        accountRepository: AccountRepository,
        transactionAdapter: TransactionalAdapter<LegalEntitiesDatabase>
    ) {
        this.draftAccountRepository = draftAccountRepository;
        this.investmentAccountService = investmentAccountService;
        this.accountRepository = accountRepository;
        this.transactionAdapter = transactionAdapter;
    }

    async execute(profileId: string, draftAccountId: string): Promise<string | null> {
        try {
            const draftAccount = await this.draftAccountRepository.getDraftForProfile<DraftAccount>(profileId, draftAccountId);
            if (!draftAccount.verifyCompletion()) {
                throw new Error('DRAFT_NOT_COMPLETED');
            }

            if (draftAccount.isCorporate() || draftAccount.isTrust()) {
                const companyDraft = draftAccount as CompanyDraftAccount;
                const ein = companyDraft.getEIN();
                if (!await this.accountRepository.isEinUnique(ein)) {
                    throw new Error('EIN_ALREADY_EXISTS');
                }
            }

            switch (true) {
                case draftAccount.isIndividual():
                    await this.openIndividualAccount(draftAccount as IndividualDraftAccount);
                    break;
                case draftAccount.isCorporate():
                    await this.openCorporateAccount(draftAccount as CorporateDraftAccount);
                    break;
                case draftAccount.isTrust():
                    await this.openTrustAccount(draftAccount as TrustDraftAccount);
                    break;
                default:
                    throw new Error('DRAFT_UNKNOWN_TYPE');
            }

            return null;
        } catch (error: any) {
            console.error(error.message);
            return error.message;
        }
    }

    private async openIndividualAccount(draftAccount: IndividualDraftAccount): Promise<void> {
        await this.openAccount(draftAccount, AccountType.INDIVIDUAL);
    }

    private async openCorporateAccount(draftAccount: CorporateDraftAccount): Promise<void> {
        await this.openAccount(draftAccount, AccountType.CORPORATE);
    }

    private async openTrustAccount(draftAccount: TrustDraftAccount): Promise<void> {
        await this.openAccount(draftAccount, AccountType.TRUST);
    }

    private async openAccount(draftAccount: DraftAccount, accountType: AccountType): Promise<void> {
        const {profileId, draftId} = draftAccount.toObject();

        const accountOpened = await this.investmentAccountService.openAccount(profileId, draftId, accountType);
        if (!accountOpened) {
            throw new Error(`CANNOT_OPEN_ANOTHER_ACCOUNT_OF_TYPE_${accountType}`);
        }

        const status = await this.transactionAdapter.transaction(`Open ${accountType} account "${draftId}" for profile ${profileId}`, async () => {
            const account = draftAccount.transformIntoAccount();
            if (accountType === AccountType.INDIVIDUAL) {
                await this.accountRepository.createIndividualAccount(account as IndividualAccount);
            } else {
                await this.accountRepository.createCompanyAccount(account as CompanyAccount);
            }
            await this.draftAccountRepository.removeDraft(profileId, draftId);
        });

        if (!status) {
            throw new Error('ACCOUNT_TRANSFORMATION_FAILED');
        }
    }
}