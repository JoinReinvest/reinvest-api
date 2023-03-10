import {
    LegalEntitiesDatabaseAdapterProvider,
    legalEntitiesDraftAccountTable,
} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {IdGeneratorInterface} from "IdGenerator/IdGenerator";
import {
    DraftAccount,
    DraftAccountState,
    DraftAccountType,
    DraftInput
} from "LegalEntities/Domain/DraftAccount/DraftAccount";
import {LegalEntitiesDraftAccount} from "LegalEntities/Adapter/Database/LegalEntitiesSchema";
import {Selectable} from "kysely";

export class DraftAccountRepository {
    public static getClassName = (): string => "DraftAccountRepository";
    private databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider;
    private idGenerator: IdGeneratorInterface;

    constructor(databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider, uniqueGenerator: IdGeneratorInterface) {
        this.databaseAdapterProvider = databaseAdapterProvider;
        this.idGenerator = uniqueGenerator;
    }

    async getActiveDraftsOfType(type: DraftAccountType, profileId: string): Promise<DraftAccount[]> {
        const data = await this.databaseAdapterProvider.provide()
            .selectFrom(legalEntitiesDraftAccountTable)
            .select(['profileId', 'draftId', 'state', 'accountType', 'data'])
            .where('accountType', '=', type)
            .where('state', '=', DraftAccountState.ACTIVE)
            .where('profileId', '=', profileId)
            .execute();

        if (!data) {
            return [];
        }

        return data.map((draft: Selectable<LegalEntitiesDraftAccount>) => DraftAccount.create(draft as DraftInput))
    }

    async storeDraft(draft: DraftAccount): Promise<boolean> {
        const {draftId, profileId, accountType, state, data} = draft.toObject();
        try {
            await this.databaseAdapterProvider.provide()
                .insertInto(legalEntitiesDraftAccountTable)
                .values({
                    draftId,
                    profileId,
                    accountType,
                    state,
                    data: JSON.stringify(data)
                })
                .onConflict((oc) => oc
                    .column('draftId')
                    .doUpdateSet({
                        state,
                        data: JSON.stringify(data)
                    })
                    .where(`${legalEntitiesDraftAccountTable}.profileId`, '=', profileId)
                )
                .returning('draftId')
                .executeTakeFirstOrThrow();

            return true;
        } catch (error: any) {
            console.error(`Cannot create draft account: ${error.message}`);
            return false;
        }
    }

    async getDraftForProfile<DraftAccountType>(profileId: string, draftAccountId: string): Promise<DraftAccountType> {
        const draft = await this.databaseAdapterProvider.provide()
            .selectFrom(legalEntitiesDraftAccountTable)
            .select(['profileId', 'draftId', 'state', 'accountType', 'data'])
            .where('profileId', '=', profileId)
            .where('draftId', '=', draftAccountId)
            .limit(1)
            .executeTakeFirstOrThrow();

        return DraftAccount.create(draft as DraftInput) as DraftAccountType;
    }
}