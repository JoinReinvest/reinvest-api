import { CompanyId, ProfileId } from "../../Common/Model/Id";
import { NonEmptyString } from "../../Common/Model/TypeValidators";
import { Address, Domicile } from "./Address";

export class CompanyName extends NonEmptyString {}

export class EIN extends NonEmptyString {}

export class Company {
  private id: CompanyId;
  private profileId: ProfileId;
  private companyName: CompanyName;
  private ein: EIN;
  private domicile: Domicile;
  private address: Address;

  constructor(
    id: CompanyId,
    profileId: ProfileId,
    companyName: CompanyName,
    ein: EIN,
    domicile: Domicile,
    address: Address
  ) {
    this.id = id;
    this.profileId = profileId;
    this.companyName = companyName;
    this.ein = ein;
    this.domicile = domicile;
    this.address = address;
  }

  getId(): CompanyId {
    return this.id;
  }
}
