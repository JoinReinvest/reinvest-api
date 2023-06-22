import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { legalEntitiesBannedListTable, LegalEntitiesDatabaseAdapterProvider } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { LegalEntitiesBannedList } from 'LegalEntities/Adapter/Database/LegalEntitiesSchema';

export enum BannedType {
  PROFILE = 'PROFILE',
  COMPANY = 'COMPANY',
  STAKEHOLDER = 'STAKEHOLDER',
}

export class BanRepository {
  private databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider;
  private idGenerator: IdGeneratorInterface;

  constructor(databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider, idGenerator: IdGeneratorInterface) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.idGenerator = idGenerator;
  }

  public static getClassName = (): string => 'BanRepository';

  async getActiveBannedRecord(type: BannedType, profileId: UUID, accountId: UUID | null, stakeholderId: UUID | null): Promise<LegalEntitiesBannedList | null> {
    let idColumn;
    let id;
    switch (type) {
      case BannedType.COMPANY:
        idColumn = 'accountId';
        id = accountId;
        break;
      case BannedType.STAKEHOLDER:
        idColumn = 'stakeholderId';
        id = stakeholderId;
        break;
      case BannedType.PROFILE:
        idColumn = 'profileId';
        id = profileId;
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

  async addBannedRecord(bannedRecord: Partial<LegalEntitiesBannedList>): Promise<void> {
    const activeBannedRecord = await this.getActiveBannedRecord(
      bannedRecord.type!,
      bannedRecord.profileId!,
      bannedRecord.accountId ?? null,
      bannedRecord.stakeholderId ?? null,
    );

    if (activeBannedRecord) {
      return;
    }

    const id = this.idGenerator.createUuid();
    const values = <LegalEntitiesBannedList>{ ...bannedRecord, id };

    await this.databaseAdapterProvider.provide().insertInto(legalEntitiesBannedListTable).values(values).execute();
  }
}
