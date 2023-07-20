import { Pagination, UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import {
  legalEntitiesBannedListTable,
  legalEntitiesCompanyAccountTable,
  LegalEntitiesDatabaseAdapterProvider,
  legalEntitiesProfileTable,
} from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { LegalEntitiesBannedList } from 'LegalEntities/Adapter/Database/LegalEntitiesSchema';
import { BannedEntity, BannedType } from 'LegalEntities/Domain/BannedEntity';
import { BannedView } from 'LegalEntities/Port/Api/BanController';
import { DateTime } from 'Money/DateTime';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class BanRepository {
  private databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider;
  private idGenerator: IdGeneratorInterface;
  private eventBus: EventBus;

  constructor(databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider, idGenerator: IdGeneratorInterface, eventBus: EventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.idGenerator = idGenerator;
    this.eventBus = eventBus;
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

  async addBannedRecord(bannedRecord: Partial<LegalEntitiesBannedList>, events: DomainEvent[] = []): Promise<void> {
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

    if (events.length > 0) {
      await this.eventBus.publishMany(events);
    }
  }

  async listBanned(pagination: Pagination): Promise<BannedView[]> {
    const result = await this.databaseAdapterProvider
      .provide()
      .selectFrom(`${legalEntitiesBannedListTable} as banned`)
      .leftJoin(`${legalEntitiesCompanyAccountTable}`, `banned.accountId`, `${legalEntitiesCompanyAccountTable}.accountId`)
      .leftJoin(`${legalEntitiesProfileTable}`, `banned.profileId`, `${legalEntitiesProfileTable}.profileId`)
      .select([
        'banned.id',
        'banned.type',
        'banned.dateCreated',
        'banned.profileId',
        'banned.reasons',
        'banned.anonymizedSensitiveNumber',
        'banned.status',
        'banned.accountId',
        `${legalEntitiesProfileTable}.name`,
        `${legalEntitiesCompanyAccountTable}.companyName`,
      ])
      .orderBy('dateCreated', 'desc')
      .limit(pagination.perPage)
      .offset(pagination.perPage * pagination.page)
      .execute();

    return result.map((row): BannedView => {
      return {
        banId: row.id,
        bannedObject: row.type,
        dateCreated: DateTime.from(row.dateCreated).toIsoDateTime(),
        profileId: row.profileId,
        reason: row.reasons,
        ssnEin: row.anonymizedSensitiveNumber,
        status: row.status,
        banType: row.type === BannedType.PROFILE ? 'PROFILE' : 'ACCOUNT',
        accountId: row.accountId ?? null,
        // @ts-ignore
        label: !row?.companyName ? `${row?.name?.firstName ?? ''} ${row?.name?.lastName ?? ''}` : row?.companyName?.name ?? '',
      };
    });
  }

  async findBannedEntityById(banId: UUID): Promise<BannedEntity | null> {
    const result = await this.databaseAdapterProvider
      .provide()
      .selectFrom(legalEntitiesBannedListTable)
      .selectAll()
      .where('id', '=', banId)
      .castTo<BannedEntity>()
      .limit(1)
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    return result;
  }

  async unban(banId: UUID): Promise<void> {
    await this.databaseAdapterProvider
      .provide()
      .updateTable(legalEntitiesBannedListTable)
      .set({ status: 'CANCELLED', dateCancelled: DateTime.now().toDate() })
      .where('id', '=', banId)
      .execute();
  }
}
