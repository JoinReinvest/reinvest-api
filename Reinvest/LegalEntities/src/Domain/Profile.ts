import { LegalEntityDocumentRemoved } from 'LegalEntities/Domain/Events/DocumentEvents';
import { Address, AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { DateOfBirth, DateOfBirthInput } from 'LegalEntities/Domain/ValueObject/DateOfBirth';
import { IdentityDocument, IdScanInput } from 'LegalEntities/Domain/ValueObject/Document';
import { Domicile, DomicileInput } from 'LegalEntities/Domain/ValueObject/Domicile';
import { InvestingExperience, InvestingExperienceInput } from 'LegalEntities/Domain/ValueObject/InvestingExperience';
import { PersonalName, PersonalNameInput } from 'LegalEntities/Domain/ValueObject/PersonalName';
import { PersonalStatement, PersonalStatementInput, PersonalStatementType } from 'LegalEntities/Domain/ValueObject/PersonalStatements';
import { SensitiveNumberSchema, SSN } from 'LegalEntities/Domain/ValueObject/SensitiveNumber';
import { ToObject } from 'LegalEntities/Domain/ValueObject/ToObject';
import { ValidationError, ValidationErrorEnum } from 'LegalEntities/Domain/ValueObject/TypeValidators';

export type ProfileSchema = {
  address: AddressInput | null;
  dateOfBirth: string | null;
  domicile: DomicileInput | null;
  externalId: string;
  idScan: IdScanInput | null;
  investingExperience: InvestingExperienceInput | null;
  isCompleted: boolean;
  label: string;
  name: PersonalNameInput | null;
  profileId: string;
  ssn: string | null;
  ssnObject: SensitiveNumberSchema | null;
  statements: PersonalStatementInput[];
};

export class Profile {
  private profileId: string;
  private externalId: string;
  private label: string;
  private ssn: SSN | null = null;
  private name: PersonalName | null = null;
  private dateOfBirth: DateOfBirth | null = null;
  private address: Address | null = null;
  private idScan: IdentityDocument | null = null;
  private domicile: Domicile | null = null;
  private investingExperience: InvestingExperience | null = null;
  private statements: PersonalStatement[] = [];
  private completed: boolean = false;
  private completionErrors: string[] = [];

  constructor(profileId: string, externalId: string, label: string) {
    this.profileId = profileId;
    this.externalId = externalId;
    this.label = label;
  }

  setSSN(ssn: SSN): void {
    this.ssn = ssn;
  }

  setName(name: PersonalName) {
    this.name = name;
    this.label = name.getLabel();
  }

  setDateOfBirth(dateOfBirth: DateOfBirth) {
    this.dateOfBirth = dateOfBirth;
  }

  setAddress(address: Address) {
    this.address = address;
  }

  setIdentityDocument(idScan: IdentityDocument) {
    this.idScan = idScan;
  }

  replaceIdentityDocumentAndReturnRemoved(idScan: IdentityDocument): LegalEntityDocumentRemoved[] {
    if (this.idScan === null) {
      this.idScan = idScan;

      return [];
    }

    return this.idScan.replaceDocumentsAndReturnRemoved(idScan);
  }

  setDomicile(domicile: Domicile) {
    this.domicile = domicile;
  }

  setInvestingExperience(investingExperience: InvestingExperience): void {
    this.investingExperience = investingExperience;
  }

  addStatement(statement: PersonalStatement) {
    const statements = this.statements.filter((currentStatement: PersonalStatement) => !statement.isTheSameType(currentStatement));

    statements.push(statement);
    this.statements = statements;
  }

  removeStatement(statementType: PersonalStatementType) {
    this.statements = this.statements.filter((statement: PersonalStatement) => !statement.isType(statementType));
  }

  isCompleted(): boolean {
    return this.completed;
  }

  setAsCompleted() {
    this.completed = true;
  }

  static create(data: ProfileSchema): Profile {
    try {
      const { profileId, externalId, label, name, dateOfBirth, address, idScan, domicile, ssnObject, investingExperience, statements, isCompleted } = data;
      const profile = new Profile(profileId, externalId, label);

      if (name) {
        profile.setName(PersonalName.create(name));
      }

      if (dateOfBirth) {
        const date = { dateOfBirth } as DateOfBirthInput;
        profile.setDateOfBirth(DateOfBirth.create(date));
      }

      if (address) {
        profile.setAddress(Address.create(address));
      }

      if (idScan) {
        profile.setIdentityDocument(IdentityDocument.create(idScan));
      }

      if (domicile) {
        profile.setDomicile(Domicile.create(domicile));
      }

      if (ssnObject) {
        profile.setSSN(SSN.create(ssnObject));
      }

      if (investingExperience) {
        profile.setInvestingExperience(InvestingExperience.create(investingExperience));
      }

      if (statements) {
        for (const rawStatement of statements) {
          const statement = PersonalStatement.create(rawStatement);
          profile.addStatement(statement);
        }
      }

      if (isCompleted) {
        profile.setAsCompleted();
      }

      return profile;
    } catch (error: any) {
      console.error(`Profile restoration failed: ${error.message}`, error);
      throw new ValidationError(ValidationErrorEnum.FAILED, 'profile');
    }
  }

  exposeSSN(): string | null {
    try {
      return this.ssn ? this.ssn.decrypt() : null;
    } catch (error: any) {
      return null;
    }
  }

  toObject(): ProfileSchema {
    return {
      profileId: this.profileId,
      externalId: this.externalId,
      label: this.label,
      ssnObject: this.get(this.ssn),
      ssn: this.ssn !== null ? this.ssn.getHash() : null,
      name: this.get(this.name),
      dateOfBirth: this.get(this.dateOfBirth),
      address: this.get(this.address),
      idScan: this.get(this.idScan),
      domicile: this.get(this.domicile),
      investingExperience: this.get(this.investingExperience),
      statements: this.statements.map(statement => statement.toObject()),
      isCompleted: this.completed,
    };
  }

  getStatements(): PersonalStatement[] {
    return this.statements;
  }

  private get(value: ToObject | null) {
    if (value === null) {
      return null;
    }

    return value.toObject();
  }

  verifyCompletion() {
    this.completionErrors = [];
    const isAnyNull =
      this.ssn === null ||
      this.name === null ||
      this.dateOfBirth === null ||
      this.address === null ||
      this.idScan === null ||
      this.investingExperience === null ||
      this.domicile === null;

    if (isAnyNull) {
      this.completionErrors.push('Some of the required fields are missing');

      return false;
    }

    const isAccreditedInvestorStatementExist = this.statements.find((statement: PersonalStatement) =>
      statement.isType(PersonalStatementType.AccreditedInvestor),
    );

    const isTermsAndConditionsStatementExist = this.statements.find((statement: PersonalStatement) =>
      statement.isType(PersonalStatementType.TermsAndConditions),
    );

    const isPrivacyPolicyStatementExist = this.statements.find((statement: PersonalStatement) => statement.isType(PersonalStatementType.PrivacyPolicy));

    if (!isAccreditedInvestorStatementExist || !isTermsAndConditionsStatementExist || !isPrivacyPolicyStatementExist) {
      this.completionErrors.push('Some of the required statements are missing (Accredited Investor, Terms and Conditions or Privacy Policy)');

      return false;
    }

    return true;
  }

  getCompletionErrors() {
    return this.completionErrors;
  }
}
