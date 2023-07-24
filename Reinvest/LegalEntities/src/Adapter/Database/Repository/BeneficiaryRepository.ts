import { legalEntitiesBeneficiaryTable, LegalEntitiesDatabaseAdapterProvider } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { LegalEntitiesBeneficiaryTable } from 'LegalEntities/Adapter/Database/LegalEntitiesSchema';
import { BeneficiaryAccount, BeneficiaryName } from 'LegalEntities/Domain/Accounts/BeneficiaryAccount';
import { AvatarInput } from 'LegalEntities/Domain/ValueObject/Document';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class BeneficiaryRepository {
  private databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider;
  private eventsPublisher: SimpleEventBus;

  constructor(databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider, eventsPublisher: SimpleEventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.eventsPublisher = eventsPublisher;
  }

  public static getClassName = (): string => 'BeneficiaryRepository';

  public async findBeneficiary(profileId: string, beneficiaryId: string): Promise<BeneficiaryAccount | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(legalEntitiesBeneficiaryTable)
      .selectAll()
      .where('profileId', '=', profileId)
      .where('accountId', '=', beneficiaryId)
      .limit(1)
      .castTo<LegalEntitiesBeneficiaryTable>()
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.castToObject(data);
  }

  async storeBeneficiary(beneficiary: BeneficiaryAccount, events: DomainEvent[] = []): Promise<void> {
    const data = this.castToTable(beneficiary);

    await this.databaseAdapterProvider
      .provide()
      .insertInto(legalEntitiesBeneficiaryTable)
      .values({ ...data })
      .onConflict(oc =>
        oc.column('accountId').doUpdateSet({
          avatarJson: eb => eb.ref(`excluded.avatarJson`),
          nameJson: eb => eb.ref(`excluded.nameJson`),
          label: eb => eb.ref(`excluded.label`),
          isArchived: eb => eb.ref(`excluded.isArchived`),
        }),
      )
      .execute();

    await this.publishEvents(events);
  }

  async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }

  async findBeneficiaryAccounts(profileId: string): Promise<BeneficiaryAccount[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(legalEntitiesBeneficiaryTable)
      .selectAll()
      .where('profileId', '=', profileId)
      .where('isArchived', '=', false)
      .castTo<LegalEntitiesBeneficiaryTable>()
      .execute();

    if (!data) {
      return [];
    }

    return data.map(this.castToObject);
  }

  private castToTable(beneficiary: BeneficiaryAccount): LegalEntitiesBeneficiaryTable {
    const beneficiarySchema = beneficiary.toObject();

    return <LegalEntitiesBeneficiaryTable>{
      accountId: beneficiarySchema.accountId,
      avatarJson: beneficiarySchema.avatar,
      individualId: beneficiarySchema.individualId,
      nameJson: beneficiarySchema.name,
      profileId: beneficiarySchema.profileId,
      label: beneficiarySchema.label,
      isArchived: beneficiarySchema.isArchived,
    };
  }

  private castToObject(data: LegalEntitiesBeneficiaryTable): BeneficiaryAccount {
    return BeneficiaryAccount.create({
      accountId: data.accountId,
      avatar: data.avatarJson as AvatarInput | null,
      individualId: data.individualId,
      name: data.nameJson as BeneficiaryName,
      profileId: data.profileId,
      isArchived: data.isArchived,
    });
  }
}
