import { VertaloSynchronizationRecordType } from 'Registration/Domain/VendorModel/Vertalo/VertaloTypes';

export class VertaloSynchronizationRecord {
  private data: VertaloSynchronizationRecordType;
  private _wasUpdated: boolean = false;

  constructor(data: VertaloSynchronizationRecordType) {
    this.data = data;
  }

  static create(data: VertaloSynchronizationRecordType): VertaloSynchronizationRecord {
    return new VertaloSynchronizationRecord(data);
  }

  isOutdated(crc: string): boolean {
    return this.data.crc !== crc;
  }

  getNextVersion() {
    return this.data.version + 1;
  }

  getVersion() {
    return this.data.version;
  }

  getRecordId() {
    return this.data.recordId;
  }

  getCrc() {
    return this.data.crc;
  }

  wasUpdated(): boolean {
    return this._wasUpdated;
  }

  setCrc(crc: string) {
    this.data.crc = crc;
    this._wasUpdated = true;
  }

  getInvestorIds() {
    const { customerId, investorId } = this.data.vertaloIds;

    if (!customerId || !investorId) {
      throw new Error('Missing investor ids');
    }

    return { customerId, investorId };
  }
}
