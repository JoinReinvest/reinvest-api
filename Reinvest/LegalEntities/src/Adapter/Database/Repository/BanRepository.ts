import { UUID } from 'HKEKTypes/Generics';
import { legalEntitiesBannedListTable, LegalEntitiesDatabaseAdapterProvider } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { LegalEntitiesBannedList } from 'LegalEntities/Adapter/Database/LegalEntitiesSchema';

export enum BannedType {
  PROFILE = 'PROFILE',
  COMPANY = 'COMPANY',
  STAKEHOLDER = 'STAKEHOLDER',
}

export class BanRepository {
  private databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'BanRepository';

  async getActiveBannedRecord(type: BannedType, id: UUID): Promise<LegalEntitiesBannedList | null> {
    let idColumn;
    switch (type) {
      case BannedType.COMPANY:
        idColumn = 'accountId';
        break;
      case BannedType.STAKEHOLDER:
        idColumn = 'stakeholderId';
        break;
      case BannedType.PROFILE:
        idColumn = 'profileId';
        break;
    }
    const bannedRecord = await this.databaseAdapterProvider
      .provide()
      .selectFrom(legalEntitiesBannedListTable)
      .selectAll()
      .where('type', '=', type)
      .where(<any>idColumn, '=', id)
      .where('status', '=', 'ACTIVE')
      .executeTakeFirst();

    if (!bannedRecord) {
      return null;
    }

    return bannedRecord;
  }

  async addBannedRecord(bannedRecord: LegalEntitiesBannedList): Promise<void> {
    const activeBannedRecord = await this.getActiveBannedRecord(bannedRecord.type, bannedRecord.profileId);

    if (activeBannedRecord) {
      return;
    }

    await this.databaseAdapterProvider.provide().insertInto(legalEntitiesBannedListTable).values(bannedRecord).execute();
  }
}
