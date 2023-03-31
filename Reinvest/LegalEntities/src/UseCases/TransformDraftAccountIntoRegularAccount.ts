import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { DraftAccountRepository } from 'LegalEntities/Adapter/Database/Repository/DraftAccountRepository';
import { InvestmentAccountsService } from 'LegalEntities/Adapter/Modules/InvestmentAccountsService';
import { AccountType } from 'LegalEntities/Domain/AccountType';
import { IndividualDraftAccount } from 'LegalEntities/Domain/DraftAccount/DraftAccount';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';

export class TransformDraftAccountIntoRegularAccount {
  public static getClassName = (): string => 'TransformDraftAccountIntoRegularAccount';
  private draftAccountRepository: DraftAccountRepository;
  private investmentAccountService: InvestmentAccountsService;
  private accountRepository: AccountRepository;
  private transactionAdapter: TransactionalAdapter<LegalEntitiesDatabase>;

  constructor(
    draftAccountRepository: DraftAccountRepository,
    investmentAccountService: InvestmentAccountsService,
    accountRepository: AccountRepository,
    transactionAdapter: TransactionalAdapter<LegalEntitiesDatabase>,
  ) {
    this.draftAccountRepository = draftAccountRepository;
    this.investmentAccountService = investmentAccountService;
    this.accountRepository = accountRepository;
    this.transactionAdapter = transactionAdapter;
  }

  async execute(profileId: string, draftAccountId: string): Promise<string | null> {
    try {
      const draftAccount = await this.draftAccountRepository.getDraftForProfile<IndividualDraftAccount>(profileId, draftAccountId);

      if (!draftAccount.isAccountCompleted()) {
        throw new Error('DRAFT_NOT_COMPLETED');
      }

      switch (true) {
        case draftAccount.isIndividual():
          await this.openIndividualAccount(draftAccount);
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
    const { profileId, draftId } = draftAccount.toObject();
    const accountOpened = await this.investmentAccountService.openAccount(profileId, draftId, AccountType.INDIVIDUAL);

    if (!accountOpened) {
      throw new Error('CANNOT_OPEN_ANOTHER_INDIVIDUAL_ACCOUNT');
    }

    const status = await this.transactionAdapter.transaction(`Open individual account "${draftId}" for profile ${profileId}`, async () => {
      const account = draftAccount.transformIntoAccount();
      await this.accountRepository.createIndividualAccount(account);
      await this.draftAccountRepository.removeDraft(profileId, draftId);
    });

    if (!status) {
      throw new Error('ACCOUNT_TRANSFORMATION_FAILED');
    }
  }
}
