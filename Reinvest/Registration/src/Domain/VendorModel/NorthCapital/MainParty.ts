import { DictionaryType } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { CrcService } from 'Registration/Domain/CrcService';
import { ProfileForSynchronization } from 'Registration/Domain/Model/Profile';
import { DocumentSchema } from 'Registration/Domain/Model/ReinvestTypes';
import { NorthCapitalMapper } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalMapper';
import { NorthCapitalMainPartyType, NorthCapitalPartyStructure } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes';

export class MainParty {
  private data: NorthCapitalMainPartyType;
  private partyCrc: string;
  private documentsCrc: string;

  constructor(data: NorthCapitalMainPartyType) {
    this.data = data;
    this.partyCrc = this.generateCrc(data.party);
    this.documentsCrc = this.generateDocumentsCrc(data.documents);
  }

  static createFromProfileForSynchronization(data: ProfileForSynchronization, email: string): MainParty | never {
    if (data === null) {
      throw new Error('Cannot create Party from null');
    }

    return new MainParty({
      party: {
        firstName: data.firstName,
        middleInitial: data?.middleName,
        lastName: data.lastName,
        domicile: NorthCapitalMapper.mapDomicile(data.domicile),
        dob: DateTime.from(data.dateOfBirth).toFormattedDate('MM-DD-YYYY'),
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
    });
  }

  private generateCrc(data: NorthCapitalPartyStructure): string {
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

  getDocuments(): DocumentSchema[] {
    return this.data.documents;
  }

  getCrc(): string {
    return JSON.stringify({
      partyCrc: this.partyCrc,
      documentsCrc: this.documentsCrc,
    });
  }

  isPartyOutdated(crc: string): boolean {
    try {
      const data = JSON.parse(crc);

      return this.partyCrc !== data?.partyCrc;
    } catch (e: any) {
      console.warn('Cannot parse CRC', e.message);

      return true;
    }
  }

  isDocumentsOutdated(crc: string): boolean {
    try {
      const data = JSON.parse(crc);

      return this.documentsCrc !== data?.documentsCrc;
    } catch (e: any) {
      console.warn('Cannot parse CRC', e.message);

      return true;
    }
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

  private generateDocumentsCrc(documents: DocumentSchema[]) {
    const values = [documents.map((document: DocumentSchema) => `${document.id}/${document.path}/${document.fileName}`).join(',') ?? ''];

    return CrcService.generateCrc(values);
  }
}
