import { Address, Domicile } from "Reinvest/LegalEntities/src/Domain/ValueObject/Address";
import { IdentityDocument } from "Reinvest/LegalEntities/src/Domain/ValueObject/Document";
import { Id, ProfileId } from "Reinvest/LegalEntities/src/Domain/ValueObject/Id";
import {
  DateOfBirth,
  FirstName,
  LastName,
  Person,
  SSN,
} from "Reinvest/LegalEntities/src/Domain/ValueObject/Person";
import { AnyString, Money } from "Reinvest/LegalEntities/src/Domain/ValueObject/TypeValidators";

export class NetWorth extends Money {}

export class NetIncome extends Money {}

export class Employer extends AnyString {}

export class Experience extends AnyString {}

export class Individual extends Person {
  private employer: Employer;
  private experience: Experience;
  private netWorth: NetWorth;
  private netIncome: NetIncome;

  constructor(
    id: Id,
    profileId: ProfileId,
    firstName: FirstName,
    lastName: LastName,
    ssn: SSN,
    domicile: Domicile,
    address: Address,
    dateOfBirth: DateOfBirth,
    employer: Employer,
    experience: Experience,
    netWorth: NetWorth,
    netIncome: NetIncome,
    identityDocument: IdentityDocument
  ) {
    super(
      id,
      profileId,
      firstName,
      lastName,
      ssn,
      domicile,
      address,
      dateOfBirth,
      identityDocument
    );

    this.employer = employer;
    this.experience = experience;
    this.netWorth = netWorth;
    this.netIncome = netIncome;
  }
}
