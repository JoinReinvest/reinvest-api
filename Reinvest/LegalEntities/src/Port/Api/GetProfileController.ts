import { UUID } from 'HKEKTypes/Generics';
import { ProfileRepository } from 'LegalEntities/Adapter/Database/Repository/ProfileRepository';
import { AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { DocumentSchema, IdScanInput } from 'LegalEntities/Domain/ValueObject/Document';
import { DomicileType } from 'LegalEntities/Domain/ValueObject/Domicile';
import { PersonalStatement, PersonalStatementType } from 'LegalEntities/Domain/ValueObject/PersonalStatements';

export type ProfileResponse = {
  details: {
    address: AddressInput | null;
    dateOfBirth: string | null;
    domicile: {
      birthCountry?: string;
      citizenshipCountry?: string;
      type?: DomicileType;
      visaType?: string;
    };
    experience: string | null;
    ssn: string | null;
    statements: {
      details: string[];
      type: PersonalStatementType;
    }[];
    firstName?: string;
    idScan?: { fileName: string; id: string }[];
    lastName?: string;
    middleName?: string;
  };
  externalId: string;
  isCompleted: boolean;
  label: string;
};

export type ProfileForSynchronization = {
  address: AddressInput | null;
  dateOfBirth: string | null;
  domicileType: DomicileType | null;
  experience: string | null;
  idScan: IdScanInput;
  ssn: string | null;
  firstName?: string;
  lastName?: string;
  middleName?: string;
};

export type ProfileName = {
  name: string;
  profileId: UUID;
};

export class GetProfileController {
  public static getClassName = (): string => 'GetProfileController';
  private profileRepository: ProfileRepository;

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  public async getProfile(profileId: string): Promise<ProfileResponse> {
    const profile = await this.profileRepository.findProfile(profileId);

    if (profile === null) {
      return {} as ProfileResponse;
    }

    const profileObject = profile.toObject();

    return {
      externalId: profileObject.externalId,
      label: profileObject.label,
      isCompleted: profileObject.isCompleted,
      details: {
        firstName: profileObject.name?.firstName,
        middleName: profileObject.name?.middleName,
        lastName: profileObject.name?.lastName,
        experience: profileObject.investingExperience ? profileObject.investingExperience?.experience : null,
        dateOfBirth: profileObject.dateOfBirth,
        domicile: {
          type: profileObject.domicile?.type,
          birthCountry: profileObject.domicile?.forGreenCard?.birthCountry ?? profileObject.domicile?.forVisa?.birthCountry,
          citizenshipCountry: profileObject.domicile?.forGreenCard?.citizenshipCountry ?? profileObject.domicile?.forVisa?.citizenshipCountry,
          visaType: profileObject.domicile?.forVisa?.visaType,
        },
        address: profileObject.address,
        ssn: profileObject.ssnObject !== null ? profileObject.ssnObject.anonymized : null,
        idScan: profileObject.idScan?.map((document: DocumentSchema) => ({
          id: document.id,
          fileName: document.fileName,
        })),
        statements: profile.getStatements().map((statement: PersonalStatement) => ({
          type: statement.getType(),
          details: statement.getDetails(),
        })),
      },
    };
  }

  public async getProfileForSynchronization(profileId: string): Promise<ProfileForSynchronization | null> {
    const profile = await this.profileRepository.findProfile(profileId);

    if (profile === null) {
      return null;
    }

    const profileObject = profile.toObject();

    return {
      firstName: profileObject.name?.firstName,
      middleName: profileObject.name?.middleName,
      lastName: profileObject.name?.lastName,
      experience: profileObject.investingExperience ? profileObject.investingExperience?.experience : null,
      dateOfBirth: profileObject.dateOfBirth,
      // @ts-ignore
      domicile: profileObject.domicile ? profileObject.domicile.type : null,
      address: profileObject.address,
      ssn: profile.exposeSSN(),
      idScan: profileObject.idScan ?? [],
    };
  }

  public async getProfileNames(profileIds: UUID[]): Promise<ProfileName[]> {
    return this.profileRepository.getProfileNames(profileIds);
  }
}
