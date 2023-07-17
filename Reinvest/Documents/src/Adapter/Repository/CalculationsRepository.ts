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
            await this.documentsDatabaseAdapterProvider
                .provide()
                .selectFrom(calculationsTable)
                .select(['data'])
                .where('id', '=', id)
                .execute()

            return true
        } catch (err: any) {
            return false
        }
    }
}
