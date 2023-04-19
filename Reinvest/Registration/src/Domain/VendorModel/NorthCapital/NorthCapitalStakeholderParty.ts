import DateTime from 'date-and-time';
import { DictionaryType } from 'HKEKTypes/Generics';
import { CrcService } from 'Registration/Domain/CrcService';
import { StakeholderForSynchronization } from 'Registration/Domain/Model/Account';
import { MappedType } from 'Registration/Domain/Model/Mapping/MappedType';
import { AccountType, DocumentSchema } from 'Registration/Domain/Model/ReinvestTypes';
import { NorthCapitalMapper } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalMapper';
import {
  NorthCapitalCompanyStakeholderType,
  NorthCapitalLink,
  NorthCapitalPartyStructure,
} from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes';

export class NorthCapitalStakeholderParty {
  private readonly data: NorthCapitalCompanyStakeholderType;
  private partyCrc: string;
  private documentsCrc: string;

  constructor(data: NorthCapitalCompanyStakeholderType) {
    this.data = data;
    this.partyCrc = this.generatePartyCrc(data.party);
    this.documentsCrc = this.generateDocumentsCrc(data.documents);
  }

  static createFromStakeholderForSynchronization(data: StakeholderForSynchronization, email: string): NorthCapitalStakeholderParty | never {
    if (data === null) {
      throw new Error('Cannot create stakeholder party from null');
    }

    return new NorthCapitalStakeholderParty({
      profileId: data.profileId,
      party: {
        firstName: data.name.firstName,
        middleInitial: data.name?.middleName,
        lastName: data.name.lastName,
        domicile: NorthCapitalMapper.mapDomicile(data.domicile),
        dob: DateTime.format(DateTime.parse(data.dateOfBirth, 'YYYY-MM-DD'), 'MM-DD-YYYY'),
        primAddress1: data.address.addressLine1,
        primAddress2: data.address?.addressLine2,
        primCity: data.address.city,
        primState: data.address.state,
        primZip: data.address.zip,
        primCountry: data.address.country,
        emailAddress: email,
        socialSecurityNumber: data.ssn ?? null,
      },
      documents: data.idScan,
      links: [
        {
          mappingConfiguration: {
            type: data.accountType === AccountType.CORPORATE ? MappedType.CORPORATE_ACCOUNT : MappedType.TRUST_ACCOUNT,
            profileId: data.profileId,
            externalId: data.accountId,
            thisIsAccountEntry: true,
          },
          linkConfiguration: {
            relatedEntryType: 'IndivACParty',
            linkType: 'member',
            primary_value: 0,
          },
        },
      ],
    });
  }

  private generatePartyCrc(data: NorthCapitalPartyStructure): string {
    const values = [
      data.domicile ?? '',
      data.firstName,
      data.middleInitial ?? '',
      data.lastName,
      data.dob,
      data.primAddress1,
      data.primAddress2 ?? '',
      data.primCity,
      data.primState,
      data.primZip,
      data.primCountry,
      data.emailAddress,
    ];

    return CrcService.generateCrc(values);
  }

  getCrc(): string {
    return JSON.stringify({
      party: this.partyCrc,
      documentsCrc: this.documentsCrc,
    });
  }

  getProfileId(): string {
    return this.data.profileId;
  }

  getPartyData(): DictionaryType {
    const entity = <DictionaryType>{};

    for (const [key, value] of Object.entries(this.data.party)) {
      if (value !== null && value !== '') {
        entity[key] = value;
      }
    }

    return entity;
  }

  getLinksConfiguration(): NorthCapitalLink[] {
    return this.data.links;
  }

  isPartyOutdated(crc: string): boolean {
    try {
      const data = JSON.parse(crc);

      return this.partyCrc !== data?.partyCrc;
    } catch (error: any) {
      console.warn(`Cannot parse crc: ${error.message}`);

      return true;
    }
  }

  isDocumentsOutdated(crc: string): boolean {
    try {
      const data = JSON.parse(crc);

      return this.documentsCrc !== data?.documentsCrc;
    } catch (error: any) {
      console.warn(`Cannot parse crc: ${error.message}`);

      return true;
    }
  }

  getDocuments(): DocumentSchema[] {
    return this.data.documents;
  }

  private generateDocumentsCrc(documents: DocumentSchema[]) {
    const values = [documents.map((document: DocumentSchema) => `${document.id}/${document.path}/${document.fileName}`).join(',') ?? ''];

    return CrcService.generateCrc(values);
  }
}
