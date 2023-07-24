import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { LegalEntitiesDatabaseAdapterProvider, legalEntitiesProfileTable } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { LegalEntitiesJsonFields, LegalEntitiesProfile } from 'LegalEntities/Adapter/Database/LegalEntitiesSchema';
import { Profile, ProfileSchema } from 'LegalEntities/Domain/Profile';
import { PersonalNameInput } from 'LegalEntities/Domain/ValueObject/PersonalName';
import { SSN } from 'LegalEntities/Domain/ValueObject/SensitiveNumber';
import { ProfileName } from 'LegalEntities/Port/Api/GetProfileController';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class ProfileRepository {
  public static getClassName = (): string => 'ProfileRepository';
  private databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider;
  private idGenerator: IdGeneratorInterface;
  private eventsPublisher: SimpleEventBus;

  constructor(databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider, uniqueGenerator: IdGeneratorInterface, eventsPublisher: SimpleEventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.idGenerator = uniqueGenerator;
    this.eventsPublisher = eventsPublisher;
  }

  private async createProfile(profileId: string, externalId: string | null = null, defaultLabel: string = 'Individual investor') {
    externalId = externalId ?? this.idGenerator.createNumericId(9);

    const profile = new Profile(profileId, externalId, defaultLabel);
    await this.storeProfile(profile);

    return profile;
  }

  public async findProfile(profileId: string): Promise<Profile | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(legalEntitiesProfileTable)
      .select([
        'profileId',
        'externalId',
        'label',
        'name',
        'ssn',
        'dateOfBirth',
        'address',
        'idScan',
        'domicile',
        'statements',
        'investingExperience',
        'isCompleted',
        'ssnObject',
      ])
      .where('profileId', '=', profileId)
      .limit(1)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return Profile.create(data as unknown as ProfileSchema);
  }

  async findOrCreateProfile(profileId: string): Promise<Profile> {
    const profile = await this.findProfile(profileId);

    return profile ?? (await this.createProfile(profileId));
  }

  async storeProfile(profile: Profile, events: DomainEvent[] = []): Promise<void> {
    const rawProfile = this.prepareProfileForStoring(profile);

    await this.databaseAdapterProvider
      .provide()
      .insertInto(legalEntitiesProfileTable)
      .values({ ...rawProfile })
      .onConflict(oc => oc.column('profileId').doUpdateSet({ ...rawProfile }))
      .execute();

    await this.publishEvents(events);
  }

  private prepareProfileForStoring(profile: Profile): LegalEntitiesProfile {
    const profileOutput = profile.toObject();
    const rawProfile = {} as LegalEntitiesProfile;

    for (const key of Object.keys(profileOutput)) {
      const value = profileOutput[key as keyof ProfileSchema];

      if (!LegalEntitiesJsonFields.includes(key)) {
        // @ts-ignore
        rawProfile[key] = value;
        continue;
      }

      if (value === null) {
        // @ts-ignore
        rawProfile[key] = null;
        continue;
      }

      // @ts-ignore
      rawProfile[key] = JSON.stringify(value);
    }

    return rawProfile;
  }

  async isSSNUnique(ssn: SSN, profileId: string): Promise<boolean> {
    const isProfileWithTheSSNExist = await this.databaseAdapterProvider
      .provide()
      .selectFrom(legalEntitiesProfileTable)
      .select(['profileId'])
      .where('ssn', '=', ssn.getHash())
      .where('profileId', '!=', profileId)
      .limit(1)
      .executeTakeFirst();

    return !isProfileWithTheSSNExist;
  }

  async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }

  async getProfileNames(profileIds: UUID[]): Promise<ProfileName[]> {
    if (profileIds.length === 0) {
      return [];
    }

    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(legalEntitiesProfileTable)
      .select(['profileId', 'name'])
      .where('profileId', 'in', profileIds)
      .castTo<{ name: PersonalNameInput; profileId: string }>()
      .execute();

    if (!data.length) {
      return [];
    }

    return data.map((profile: { name: PersonalNameInput; profileId: string }) => {
      const name = profile.name;
      const fullName = [name.firstName, name?.middleName, name.lastName].filter((value?: string) => value !== null && value !== '').join(' ');

      return {
        profileId: profile.profileId,
        name: fullName,
      };
    });
  }
}
