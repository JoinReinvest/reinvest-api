import { legalEntitiesBeneficiaryTable, LegalEntitiesDatabaseAdapterProvider } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { InsertableBeneficiary, LegalEntitiesBeneficiary } from 'LegalEntities/Adapter/Database/LegalEntitiesSchema';
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
      .select(['accountId', 'avatarJson', 'nameJson', 'individualId', 'profileId'])
      .where('profileId', '=', profileId)
      .where('accountId', '=', beneficiaryId)
      .limit(1)
      .castTo<LegalEntitiesBeneficiary>()
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.beneficiaryDaoToBeneficiaryAccount(data);
  }

  async storeBeneficiary(beneficiary: BeneficiaryAccount, events: DomainEvent[] = []): Promise<void> {
    const beneficiaryDAO = this.prepareBeneficiaryForPersisting(beneficiary);

    await this.databaseAdapterProvider
      .provide()
      .insertInto(legalEntitiesBeneficiaryTable)
      .values({ ...beneficiaryDAO })
      .onConflict(oc =>
        oc.column('accountId').doUpdateSet({
          avatarJson: eb => eb.ref(`excluded.avatarJson`),
          nameJson: eb => eb.ref(`excluded.nameJson`),
          label: eb => eb.ref(`excluded.label`),
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
      .select(['accountId', 'avatarJson', 'nameJson', 'individualId', 'profileId'])
      .where('profileId', '=', profileId)
      .castTo<LegalEntitiesBeneficiary>()
      .execute();

    return data.map(this.beneficiaryDaoToBeneficiaryAccount);
  }

  private prepareBeneficiaryForPersisting(beneficiary: BeneficiaryAccount): InsertableBeneficiary {
    const beneficiarySchema = beneficiary.toObject();

    return <InsertableBeneficiary>{
      accountId: beneficiarySchema.accountId,
      avatarJson: beneficiarySchema.avatar,
      individualId: beneficiarySchema.individualId,
      nameJson: beneficiarySchema.name,
      profileId: beneficiarySchema.profileId,
      label: beneficiarySchema.label,
    };
  }

  private beneficiaryDaoToBeneficiaryAccount(beneficiaryDao: LegalEntitiesBeneficiary): BeneficiaryAccount {
    return BeneficiaryAccount.create({
      accountId: beneficiaryDao.accountId,
      avatar: beneficiaryDao.avatarJson as AvatarInput | null,
      individualId: beneficiaryDao.individualId,
      name: beneficiaryDao.nameJson as BeneficiaryName,
      profileId: beneficiaryDao.profileId,
    });
  }
}
