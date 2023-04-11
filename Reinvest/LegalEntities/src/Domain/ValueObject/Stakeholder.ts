import { Address, AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { DateOfBirth, DateOfBirthInput } from 'LegalEntities/Domain/ValueObject/DateOfBirth';
import { DocumentSchema, IdentityDocument } from 'LegalEntities/Domain/ValueObject/Document';
import { Domicile, DomicileInput, DomicileType } from 'LegalEntities/Domain/ValueObject/Domicile';
import { PersonalName, PersonalNameInput } from 'LegalEntities/Domain/ValueObject/PersonalName';
import { SensitiveNumberSchema, SSN } from 'LegalEntities/Domain/ValueObject/SensitiveNumber';
import { ToObject } from 'LegalEntities/Domain/ValueObject/ToObject';
import { Uuid, ValidationError, ValidationErrorEnum } from 'LegalEntities/Domain/ValueObject/TypeValidators';

export type StakeholderSchema = {
  address: AddressInput;
  dateOfBirth: DateOfBirthInput;
  domicile: DomicileInput;
  id: string;
  idScan: DocumentSchema[];
  label: string;
  name: PersonalNameInput;
  ssn: SensitiveNumberSchema | string;
};

export type StakeholderInput = StakeholderSchema & {
  idScan: { fileName: string; id: string }[];
  ssn: { ssn: string };
};

export type StakeholderOutput = StakeholderInput & {
  domicile: {
    birthCountry?: string;
    citizenshipCountry?: string;
    type?: DomicileType;
    visaType?: string;
  };
  ssn: string;
};

export class Stakeholder implements ToObject {
  private ssn: SSN;
  private name: PersonalName;
  private dateOfBirth: DateOfBirth;
  private address: Address;
  private domicile: Domicile;
  private idScan: IdentityDocument;
  private id: Uuid;

  constructor(id: Uuid, ssn: SSN, name: PersonalName, dateOfBirth: DateOfBirth, address: Address, domicile: Domicile, idScan: IdentityDocument) {
    this.id = id;
    this.ssn = ssn;
    this.name = name;
    this.dateOfBirth = dateOfBirth;
    this.address = address;
    this.domicile = domicile;
    this.idScan = idScan;
  }

  static create(stakeholder: StakeholderSchema) {
    try {
      const { id, ssn, name, dateOfBirth, address, domicile, idScan } = stakeholder;
      const idObject = Uuid.create(id);
      const personalName = PersonalName.create(name);
      const dateOfBirthObject = DateOfBirth.create(dateOfBirth);
      const addressObject = Address.create(address);
      const domicileObject = Domicile.create(domicile);
      const documents = IdentityDocument.create(idScan);
      const ssnObject = SSN.create(ssn);

      return new Stakeholder(idObject, ssnObject, personalName, dateOfBirthObject, addressObject, domicileObject, documents);
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, 'stakeholder', error.message);
    }
  }

  isTheSameSSN(ssn: SSN): boolean {
    return this.getHashedSSN() === ssn.getHash();
  }

  isTheSameId(id: Uuid): boolean {
    return this.id.toString() === id.toString();
  }

  toObject(): StakeholderSchema {
    return {
      id: this.id.toString(),
      ssn: this.ssn.toObject(),
      name: this.name.toObject(),
      label: this.name.getLabel(),
      dateOfBirth: { dateOfBirth: this.dateOfBirth.toObject() },
      address: this.address.toObject(),
      domicile: this.domicile.toObject(),
      idScan: this.idScan.toObject(),
    };
  }

  getSSN(): SSN {
    return this.ssn;
  }

  private getHashedSSN(): string {
    return this.ssn.getHash();
  }
}

export class CompanyStakeholders implements ToObject {
  private stakeholders: Stakeholder[];

  constructor(stakeholders: Stakeholder[]) {
    this.stakeholders = stakeholders;
  }

  static create(data: StakeholderSchema[]): CompanyStakeholders {
    try {
      const stakeholders = data.map((stakeholder: StakeholderSchema) => Stakeholder.create(stakeholder));

      return new CompanyStakeholders(stakeholders);
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, 'stakeholders', error.message);
    }
  }

  toObject(): StakeholderSchema[] {
    return this.stakeholders.map((stakeholder: Stakeholder) => stakeholder.toObject());
  }

  addStakeholder(stakeholderToAdd: Stakeholder): void {
    this.stakeholders = this.stakeholders.filter((stakeholder: Stakeholder) => !stakeholder.isTheSameSSN(stakeholderToAdd.getSSN()));

    this.stakeholders.push(stakeholderToAdd);
  }

  removeStakeholder(id: Uuid): void {
    this.stakeholders = this.stakeholders.filter((doc: Stakeholder) => !doc.isTheSameId(id));
  }
}
