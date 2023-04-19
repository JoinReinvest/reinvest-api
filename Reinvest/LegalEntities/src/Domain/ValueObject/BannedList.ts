import { NonEmptyString } from 'Reinvest/LegalEntities/src/Domain/ValueObject/TypeValidators';

export class ObfuscatedId extends NonEmptyString {}

export enum BannedIdType {
  SSN,
  EIN,
}

export class BannedId {
  private id: ObfuscatedId;
  private type: BannedIdType;

  constructor(id: ObfuscatedId, type: BannedIdType) {
    this.id = id;
    this.type = type;
  }
}

export class BannedList {
  private bannedIds: BannedId[];

  constructor(bannedIds: BannedId[]) {
    this.bannedIds = bannedIds;
  }
}
