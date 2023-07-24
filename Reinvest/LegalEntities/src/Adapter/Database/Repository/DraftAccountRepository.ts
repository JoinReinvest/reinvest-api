import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { Selectable } from 'kysely';
import { LegalEntitiesDatabaseAdapterProvider, legalEntitiesDraftAccountTable } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { LegalEntitiesDraftAccount } from 'LegalEntities/Adapter/Database/LegalEntitiesSchema';
import {
  CorporateDraftAccount,
  DraftAccount,
  DraftAccountState,
  DraftAccountType,
  DraftInput,
  IndividualDraftAccount,
  TrustDraftAccount,
} from 'LegalEntities/Domain/DraftAccount/DraftAccount';
import { DraftsList } from 'LegalEntities/Port/Api/DraftAccountQuery';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class DraftAccountRepository {
  public static getClassName = (): string => 'DraftAccountRepository';
  private databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider;
  private idGenerator: IdGeneratorInterface;
  private eventBus: EventBus;

  constructor(databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider, uniqueGenerator: IdGeneratorInterface, eventBus: EventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.idGenerator = uniqueGenerator;
    this.eventBus = eventBus;
  }

  async getActiveDraftsOfType(type: DraftAccountType, profileId: string): Promise<DraftAccount[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(legalEntitiesDraftAccountTable)
      .select(['profileId', 'draftId', 'state', 'accountType', 'data'])
      .where('accountType', '=', type)
      .where('state', '=', DraftAccountState.ACTIVE)
      .where('profileId', '=', profileId)
      .execute();

    if (!data) {
      return [];
    }

    return data.map((draft: Selectable<LegalEntitiesDraftAccount>) => DraftAccount.create(draft as unknown as DraftInput));
  }

  async getAllActiveDraftsIds(profileId: string): Promise<DraftsList> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(legalEntitiesDraftAccountTable)
      .select(['draftId', 'accountType'])
      .where('state', '=', DraftAccountState.ACTIVE)
      .where('profileId', '=', profileId)
      .execute();

    if (!data) {
      return [];
    }

    return data.map(draft => ({
      id: draft.draftId,
      type: draft.accountType as DraftAccountType,
    }));
  }

  async storeDraft(draft: DraftAccount, events: DomainEvent[] = []): Promise<boolean> {
    const { draftId, profileId, accountType, state, data } = draft.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(legalEntitiesDraftAccountTable)
        .values({
          draftId,
          profileId,
          accountType,
          state,
          data: JSON.stringify(data),
        })
        .onConflict(oc =>
          oc
            .column('draftId')
            .doUpdateSet({
              state,
              data: JSON.stringify(data),
            })
            .where(`${legalEntitiesDraftAccountTable}.profileId`, '=', profileId),
        )
        .returning('draftId')
        .executeTakeFirstOrThrow();

      await this.eventBus.publishMany(events);

      return true;
    } catch (error: any) {
      console.error(`Cannot create draft account: ${error.message}`, error);

      return false;
    }
  }

  async getDraftForProfile<DraftAccountType extends DraftAccount>(profileId: string, draftAccountId: string): Promise<DraftAccountType | never> {
    try {
      const draft = await this.databaseAdapterProvider
        .provide()
        .selectFrom(legalEntitiesDraftAccountTable)
        .select(['profileId', 'draftId', 'state', 'accountType', 'data'])
        .where('profileId', '=', profileId)
        .where('draftId', '=', draftAccountId)
        .limit(1)
        .executeTakeFirstOrThrow();

      return DraftAccount.create(draft as unknown as DraftInput) as DraftAccountType;
    } catch (error: any) {
      throw new Error('DRAFT_NOT_EXIST');
    }
  }

  async getIndividualDraftForProfile(profileId: string, draftAccountId: string): Promise<IndividualDraftAccount | never> {
    return this.getDraftForProfile<IndividualDraftAccount>(profileId, draftAccountId);
  }

  async getCorporateDraftForProfile(profileId: string, draftAccountId: string): Promise<CorporateDraftAccount | never> {
    return this.getDraftForProfile<CorporateDraftAccount>(profileId, draftAccountId);
  }

  async getTrustDraftForProfile(profileId: string, draftAccountId: string): Promise<TrustDraftAccount | never> {
    return this.getDraftForProfile<TrustDraftAccount>(profileId, draftAccountId);
  }

  async removeDraft(profileId: string, draftId: string, events: DomainEvent[] = []): Promise<boolean> {
    try {
      await this.databaseAdapterProvider
        .provide()
        .deleteFrom(legalEntitiesDraftAccountTable)
        .where('profileId', '=', profileId)
        .where('draftId', '=', draftId)
        .execute();

      await this.eventBus.publishMany(events);

      return true;
    } catch (error: any) {
      console.log(error);

      return false;
    }
  }
}
