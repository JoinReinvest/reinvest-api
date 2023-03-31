import { MappedRecordStatus, MappedType } from './MappedType';

export type MappedRecordType = {
  email: string;
  externalId: string;
  mappedType: MappedType;
  profileId: string;
  recordId: string;
  status: MappedRecordStatus;
  version: number;
};

export class MappedRecord {
  private readonly recordId: string;
  private readonly profileId: string;
  private readonly externalId: string;
  private readonly mappedType: MappedType;
  private readonly email: string;
  private status: MappedRecordStatus;
  private version: number;

  constructor(data: MappedRecordType) {
    this.recordId = data.recordId;
    this.profileId = data.profileId;
    this.externalId = data.externalId;
    this.mappedType = data.mappedType;
    this.email = data.email;
    this.status = data.status;
    this.version = data.version;
  }

  static create(data: MappedRecordType): MappedRecord {
    return new MappedRecord(data);
  }

  isProfile() {
    return this.mappedType === MappedType.PROFILE;
  }

  getRecordId() {
    return this.recordId;
  }

  getNextVersion(): number {
    return this.version + 1;
  }

  getVersion(): number {
    return this.version;
  }

  getProfileId(): string {
    return this.profileId;
  }

  getEmail(): string {
    return this.email;
  }

  isIndividualAccount() {
    return this.mappedType === MappedType.INDIVIDUAL_ACCOUNT;
  }

  getExternalId() {
    return this.externalId;
  }
}
