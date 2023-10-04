import { DictionaryType } from 'HKEKTypes/Generics';
import { EMPTY_UUID } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { CrcService } from 'Registration/Domain/CrcService';
import { IndividualAccountForSynchronization } from 'Registration/Domain/Model/Account';
import { MappedType } from 'Registration/Domain/Model/Mapping/MappedType';
import { NorthCapitalMapper } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalMapper';
import {
  NorthCapitalIndividualAccountStructure,
  NorthCapitalIndividualAccountType,
  NorthCapitalIndividualExtendedMainPartyStructure,
  NorthCapitalLink,
} from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes';

export class NorthCapitalIndividualAccount {
  private readonly data: NorthCapitalIndividualAccountType;
  private accountCrc: string;
  private partyCrc: string;

  constructor(data: NorthCapitalIndividualAccountType) {
    this.data = data;
    this.accountCrc = this.generateAccountCrc(data.account);
    this.partyCrc = this.generateParty(data.extendedParty);
  }

  static createFromIndividualAccountForSynchronization(data: IndividualAccountForSynchronization): NorthCapitalIndividualAccount | never {
    if (data === null) {
      throw new Error('Cannot create individual account from null');
    }

    const fullName = [data.name.firstName, data.name?.middleName, data.name.lastName].filter((value?: string) => value !== null && value !== '').join(' ');
    const phoneNumber = data.phoneNumber ? parseInt(data.phoneNumber.replace('+', '').replace(/\s+/g, '')) : undefined;

    return new NorthCapitalIndividualAccount({
      profileId: data.profileId,
      extendedParty: {
        occupation: data.title ?? null,
        empStatus: NorthCapitalMapper.mapEmploymentStatus(data.employmentStatus),
        empName: data.nameOfEmployer ?? null,
        householdNetworth: data.netIncome ?? null,
        currentHouseholdIncome: data.netWorth ?? null,
      },
      account: {
        accountRegistration: fullName,
        type: 'Individual',
        streetAddress1: data.address.addressLine1,
        streetAddress2: data.address?.addressLine2,
        city: data.address.city,
        state: data.address.state,
        zip: data.address.zip,
        country: data.address.country,
        email: data.email,
        phoneNumber,
      },
      links: [
        {
          mappingConfiguration: {
            type: MappedType.PROFILE,
            profileId: data.profileId,
            externalId: EMPTY_UUID,
          },
          linkConfiguration: {
            relatedEntryType: 'IndivACParty',
            linkType: 'owner',
            primary_value: 1,
          },
        },
      ],
    });
  }

  private generateAccountCrc(data: NorthCapitalIndividualAccountType['account']): string {
    const values = [data.accountRegistration, data.streetAddress1, data.streetAddress2 ?? '', data.city, data.state, data.zip, data.country];

    return CrcService.generateCrc(values);
  }

  private generateParty(data: NorthCapitalIndividualAccountType['extendedParty']): string {
    const values = [data.occupation ?? '', data.empStatus ?? '', data.empName ?? '', data.householdNetworth ?? '', data.currentHouseholdIncome ?? ''];

    return CrcService.generateCrc(values);
  }

  getCrc(): string {
    return JSON.stringify({
      account: this.accountCrc,
      party: this.partyCrc,
    });
  }

  getProfileId(): string {
    return this.data.profileId;
  }

  getPartyData(): NorthCapitalIndividualExtendedMainPartyStructure {
    const party = <DictionaryType>{};

    for (const [key, value] of Object.entries(this.data.extendedParty)) {
      if (value !== null && value !== '') {
        party[key] = value;
      }
    }

    return party;
  }

  getAccountData(): NorthCapitalIndividualAccountStructure {
    return this.data.account;
  }

  getLinksConfiguration(): NorthCapitalLink[] {
    return this.data.links;
  }

  isOutdatedAccount(crc: string): boolean {
    try {
      return this.accountCrc !== JSON.parse(crc)?.account;
    } catch (error: any) {
      console.warn(`Cannot parse crc: ${error.message}`);

      return true;
    }
  }

  isOutdatedParty(crc: string): boolean {
    try {
      return this.partyCrc !== JSON.parse(crc)?.party;
    } catch (error: any) {
      console.warn(`Cannot parse crc: ${error.message}`);

      return true;
    }
  }
}
