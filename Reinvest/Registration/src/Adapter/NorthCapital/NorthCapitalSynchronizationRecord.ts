export enum NorthCapitalEntityType {
    PARTY = "PARTY",
    ENTITY = "ENTITY",
    ACCOUNT = "ACCOUNT"
}

export type NorthCapitalSynchronizationRecordType = {
    recordId: string;
    northCapitalId: string;
    type: NorthCapitalEntityType;
    crc: string;
    documents: string | null;
    version: number;
}

export class NorthCapitalSynchronizationRecord {
    private data: NorthCapitalSynchronizationRecordType;

    constructor(data: NorthCapitalSynchronizationRecordType) {
        this.data = data;
    }

    static create(data: NorthCapitalSynchronizationRecordType): NorthCapitalSynchronizationRecord {
        return new NorthCapitalSynchronizationRecord(data);
    }

    isOutdated(crc: string): boolean {
        return this.data.crc !== crc;
    }

    getNorthCapitalId() {
        return this.data.northCapitalId;
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
}