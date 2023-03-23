import {NorthCapitalLinkMappingConfiguration} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes";

export enum NorthCapitalEntityType {
    PARTY = "PARTY",
    ENTITY = "ENTITY",
    ACCOUNT = "ACCOUNT",
}

export type NorthCapitalLinkMapping = {
    mapping: NorthCapitalLinkMappingConfiguration,
    northCapitalId: string,
    linkId: string,
}

export type NorthCapitalSynchronizationRecordType = {
    recordId: string;
    northCapitalId: string;
    type: NorthCapitalEntityType;
    crc: string;
    documents: string | null;
    version: number;
    links: NorthCapitalLinkMapping[];
}

export class NorthCapitalSynchronizationRecord {
    private data: NorthCapitalSynchronizationRecordType;
    private _wasUpdated: boolean = false;

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

    getLinks(): NorthCapitalLinkMapping[] {
        return this.data.links;
    }

    addLink(linkId: string, northCapitalId: string, mappingConfiguration: NorthCapitalLinkMappingConfiguration) {
        this.data.links.push({
            linkId,
            northCapitalId,
            mapping: mappingConfiguration,
        });
        this._wasUpdated = true;
    }

    wasUpdated(): boolean {
        return this._wasUpdated;
    }

    setCrc(crc: string) {
        this.data.crc = crc;
        this._wasUpdated = true;
    }

    getCrc() {
        return this.data.crc;
    }
}