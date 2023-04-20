import { getDocumentRemoveEvent, LegalEntityDocumentRemoved } from 'LegalEntities/Domain/Events/DocumentEvents';
import { Address, AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { DateOfBirth, DateOfBirthInput } from 'LegalEntities/Domain/ValueObject/DateOfBirth';
import { DocumentSchema, IdentityDocument } from 'LegalEntities/Domain/ValueObject/Document';
import { SimplifiedDomicile, SimplifiedDomicileInput } from 'LegalEntities/Domain/ValueObject/Domicile';
import { PersonalName, PersonalNameInput } from 'LegalEntities/Domain/ValueObject/PersonalName';
import { SensitiveNumberSchema, SSN } from 'LegalEntities/Domain/ValueObject/SensitiveNumber';
import { ToObject } from 'LegalEntities/Domain/ValueObject/ToObject';
import { Uuid, ValidationError, ValidationErrorEnum } from 'LegalEntities/Domain/ValueObject/TypeValidators';

export type DefaultStakeholder = {
  address: AddressInput;
  dateOfBirth: DateOfBirthInput;
  domicile: SimplifiedDomicileInput;
  id: string;
  label: string;
  name: PersonalNameInput;
};

export type StakeholderSchema = DefaultStakeholder & {
  idScan: DocumentSchema[];
  ssn: SensitiveNumberSchema | string;
};

export type StakeholderInput = DefaultStakeholder & {
  idScan: { fileName: string; id: string }[];
  ssn?: { ssn: string };
};

export type StakeholderOutput = DefaultStakeholder & {
  idScan: DocumentSchema[];
  ssn: string;
};

export class Stakeholder implements ToObject {
  private ssn: SSN;
  private name: PersonalName;
  private dateOfBirth: DateOfBirth;
  private address: Address;
  private domicile: SimplifiedDomicile;
  private idScan: IdentityDocument;
  private id: Uuid;

  constructor(id: Uuid, ssn: SSN, name: PersonalName, dateOfBirth: DateOfBirth, address: Address, domicile: SimplifiedDomicile, idScan: IdentityDocument) {
    this.id = id;
    this.ssn = ssn;
    this.name = name;
    this.dateOfBirth = dateOfBirth;
    this.address = address;
    this.domicile = domicile;
    this.idScan = idScan;
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

  getRawSSN(): string {
    return this.ssn.decrypt();
  }

  getSSN(): SSN {
    return this.ssn;
  }

  private getHashedSSN(): string {
    return this.ssn.getHash();
  }

  static create(stakeholder: StakeholderSchema) {
    try {
      const { id, ssn, name, dateOfBirth, address, domicile, idScan } = stakeholder;
      const idObject = Uuid.create(id);
      const personalName = PersonalName.create(name);
      const dateOfBirthObject = DateOfBirth.create(dateOfBirth);
      const addressObject = Address.create(address);
      const domicileObject = SimplifiedDomicile.create(domicile);
      const documents = IdentityDocument.create(idScan);
      const ssnObject = SSN.create(ssn);

      return new Stakeholder(idObject, ssnObject, personalName, dateOfBirthObject, addressObject, domicileObject, documents);
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, 'stakeholder', error.message);
    }
  }

  removeDocuments(): LegalEntityDocumentRemoved[] {
    return this.idScan.removeAllDocuments();
  }

  getId(): Uuid {
    return this.id;
  }

  getDocuments(): DocumentSchema[] {
    return this.idScan.toObject();
  }

  removeDocumentsIfDifferent(newDocuments: DocumentSchema[]): LegalEntityDocumentRemoved[] {
    const currentDocuments = this.getDocuments();
    const documentsToRemove = currentDocuments.filter((currentDocument: DocumentSchema) => {
      return !newDocuments.find((newDocument: DocumentSchema) => newDocument.id === currentDocument.id);
    });

    return documentsToRemove.map((document: DocumentSchema) => getDocumentRemoveEvent(document));
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

  addStakeholder(stakeholderToAdd: Stakeholder): LegalEntityDocumentRemoved[] {
    let events: LegalEntityDocumentRemoved[] = [];
    const stakeholderExists = this.stakeholders.find((stakeholder: Stakeholder) => stakeholder.isTheSameSSN(stakeholderToAdd.getSSN()));

    if (stakeholderExists) {
      events = stakeholderExists.removeDocumentsIfDifferent(stakeholderToAdd.getDocuments());
    }

    this.stakeholders = this.stakeholders.filter((stakeholder: Stakeholder) => !stakeholder.isTheSameSSN(stakeholderToAdd.getSSN()));
    this.stakeholders.push(stakeholderToAdd);

    return events;
  }

  updateStakeholder(stakeholderToUpdate: Stakeholder): LegalEntityDocumentRemoved[] {
    let events: LegalEntityDocumentRemoved[] = [];
    const stakeholderExists = this.getStakeholderById(stakeholderToUpdate.getId());

    const stakeholders = this.stakeholders.filter((stakeholder: Stakeholder) => !stakeholder.isTheSameId(stakeholderToUpdate.getId())); // stakeholders without stakeholder to update
    const stakeholderWithTheSameSSNExists = stakeholders.find((stakeholder: Stakeholder) => stakeholder.isTheSameSSN(stakeholderToUpdate.getSSN())); // validating if ssn is duplicated

    if (stakeholderWithTheSameSSNExists) {
      throw new ValidationError(ValidationErrorEnum.NOT_UNIQUE, 'ssn', stakeholderToUpdate.getId().toString());
    }

    if (stakeholderExists) {
      events = stakeholderExists.removeDocumentsIfDifferent(stakeholderToUpdate.getDocuments());
    }

    stakeholders.push(stakeholderToUpdate);
    this.stakeholders = stakeholders;

    return events;
  }

  removeStakeholder(id: Uuid): LegalEntityDocumentRemoved[] {
    const stakeholderToRemove = this.getStakeholderById(id);
    this.stakeholders = this.stakeholders.filter((doc: Stakeholder) => !doc.isTheSameId(id));

    if (stakeholderToRemove) {
      return stakeholderToRemove.removeDocuments();
    }

    return [];
  }

  removeAllStakeholders(): LegalEntityDocumentRemoved[] {
    let events: LegalEntityDocumentRemoved[] = [];

    this.stakeholders.map((stakeholder: Stakeholder) => {
      const id = stakeholder.getId();
      events = events.concat(this.removeStakeholder(id));
    });

    return events;
  }

  getStakeholderById(id: Uuid): Stakeholder | undefined {
    return this.stakeholders.find((stakeholder: Stakeholder) => stakeholder.isTheSameId(id));
  }
}
