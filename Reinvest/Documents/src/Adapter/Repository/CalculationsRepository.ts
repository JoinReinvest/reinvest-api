import { calculationsTable, DocumentsDatabaseAdapterProvider } from 'Documents/Adapter/Database/DatabaseAdapter'
import { UUID } from 'HKEKTypes/Generics'

export class CalculationsRepository {
    public static getClassName = (): string => 'CalculationsRepository'

    private documentsDatabaseAdapterProvider: DocumentsDatabaseAdapterProvider

    constructor (documentsDatabaseAdapterProvider: DocumentsDatabaseAdapterProvider) {
        this.documentsDatabaseAdapterProvider = documentsDatabaseAdapterProvider
    }

    async create (id: UUID, data: string) {
        try {
            await this.documentsDatabaseAdapterProvider
                .provide()
                .insertInto(calculationsTable)
                .values({
                    id,
                    data,
                })
                .execute()

            return true
        } catch (err: any) {
            return false
        }
    }

    async get (id: UUID) {
        try {
            const calculationData = await this.documentsDatabaseAdapterProvider
                .provide()
                .selectFrom(calculationsTable)
                .select(['data'])
                .where('id', '=', id)
                .limit(1)
                .executeTakeFirst();

            return calculationData?.data || false
        } catch (err: any) {
            return false
        }
    }
}
