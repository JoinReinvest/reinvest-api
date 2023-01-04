import { ProfileId, StakeholderId } from "../../Common/Model/Id";
import {
  AnyString,
  DateTime,
  Money,
  NonEmptyString,
} from "../../Common/Model/TypeValidators";
import { Address, Domicile } from "./Address";

export class FirstName extends NonEmptyString {}

export class LastName extends NonEmptyString {}

export class DateOfBirth extends DateTime {}

export class SSN extends NonEmptyString {}

export class NetWorth extends Money {}

export class NetIncome extends Money {}

export class Employer extends AnyString {}

export class Experience extends AnyString {}

export class Stakeholder {
  private id: StakeholderId;
  private profileId: ProfileId;
  private firstName: FirstName;
  private lastName: LastName;
  private ssn: SSN;
  private domicile: Domicile;
  private address: Address;
  private dateOfBirth: DateOfBirth;
  private employer: Employer;
  private experience: Experience;
  private netWorth: NetWorth;
  private netIncome: NetIncome;

  constructor(
    id: StakeholderId,
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
    netIncome: NetIncome
  ) {
    this.profileId = profileId;
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.ssn = ssn;
    this.domicile = domicile;
    this.address = address;
    this.dateOfBirth = dateOfBirth;
    this.employer = employer;
    this.experience = experience;
    this.netWorth = netWorth;
    this.netIncome = netIncome;
  }

  public getId(): StakeholderId {
    return this.id;
  }

  public getProfileId(): ProfileId {
    return this.profileId;
  }
}
