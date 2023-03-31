import { DraftAccountType } from 'LegalEntities/Domain/DraftAccount/DraftAccount';
import { ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { CompleteDraftAccount, IndividualDraftAccountInput } from 'LegalEntities/UseCases/CompleteDraftAccount';
import { CreateDraftAccount } from 'LegalEntities/UseCases/CreateDraftAccount';
import { DraftAccountQuery, DraftQuery, DraftsList } from 'LegalEntities/UseCases/DraftAccountQuery';
import { RemoveDraftAccount } from 'LegalEntities/UseCases/RemoveDraftAccount';
import { TransformDraftAccountIntoRegularAccount } from 'LegalEntities/UseCases/TransformDraftAccountIntoRegularAccount';

export class DraftAccountsController {
  public static getClassName = (): string => 'DraftAccountsController';
  private createDraftAccountUseCase: CreateDraftAccount;
  private completeDraftAccount: CompleteDraftAccount;
  private draftAccountQuery: DraftAccountQuery;
  private transformDraftIntoAccount: TransformDraftAccountIntoRegularAccount;
  private removeDraftUseCase: RemoveDraftAccount;

  constructor(
    createDraftAccountUseCase: CreateDraftAccount,
    completeDraftAccount: CompleteDraftAccount,
    draftAccountQuery: DraftAccountQuery,
    transformDraftIntoAccount: TransformDraftAccountIntoRegularAccount,
    removeDraftUseCase: RemoveDraftAccount,
  ) {
    this.createDraftAccountUseCase = createDraftAccountUseCase;
    this.completeDraftAccount = completeDraftAccount;
    this.draftAccountQuery = draftAccountQuery;
    this.transformDraftIntoAccount = transformDraftIntoAccount;
    this.removeDraftUseCase = removeDraftUseCase;
  }

  public async createDraftAccount(profileId: string, type: DraftAccountType): Promise<{ status: boolean; id?: string; message?: string }> {
    try {
      const draftId = await this.createDraftAccountUseCase.execute(profileId, type);

      return {
        id: draftId,
        status: true,
      };
    } catch (error) {
      return {
        status: false,
        message: `Draft account with type ${type} already exists`,
      };
    }
  }

  public async readDraft(profileId: string, draftId: string, accountType: DraftAccountType): Promise<DraftQuery | null> {
    try {
      return await this.draftAccountQuery.getDraftDetails(profileId, draftId, accountType);
    } catch (error: any) {
      return null;
    }
  }

  public async removeDraft(profileId: string, draftId: string): Promise<boolean> {
    try {
      return await this.removeDraftUseCase.execute(profileId, draftId);
    } catch (error: any) {
      return false;
    }
  }

  public async listDrafts(profileId: string): Promise<DraftsList> {
    return this.draftAccountQuery.listDrafts(profileId);
  }

  public async completeIndividualDraftAccount(
    profileId: string,
    draftAccountId: string,
    individualInput: IndividualDraftAccountInput,
  ): Promise<ValidationErrorType[]> {
    try {
      return await this.completeDraftAccount.completeIndividual(profileId, draftAccountId, individualInput);
    } catch (error: any) {
      return [error.message];
    }
  }

  public async transformDraftAccountIntoRegularAccount(profileId: string, draftAccountId: string): Promise<string | null> {
    try {
      return await this.transformDraftIntoAccount.execute(profileId, draftAccountId);
    } catch (error: any) {
      return error.message;
    }
  }
}
