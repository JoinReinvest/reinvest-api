import {CrcService} from "Registration/Domain/CrcService";
import {
    NorthCapitalCompanyEntityType, NorthCapitalCompanyStakeholderType,
    NorthCapitalEntityStructure,
    NorthCapitalLink
} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes";

import {CompanyForSynchronization, StakeholderForSynchronization,} from "Registration/Domain/Model/Account";
import {DictionaryType} from "HKEKTypes/Generics";
import {NorthCapitalMapper} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalMapper";
import {AccountType, DocumentSchema} from "Registration/Domain/Model/ReinvestTypes";
import {MappedType} from "Registration/Domain/Model/Mapping/MappedType";
import DateTime from "date-and-time";

export class NorthCapitalStakeholderParty {
    private readonly data: NorthCapitalCompanyStakeholderType;
    // private entityCrc: string;
    // private documentsCrc: string;

    constructor(data: NorthCapitalCompanyStakeholderType) {
        this.data = data;
        // todo finish mapping stakeholder party!!
        // this.entityCrc = this.generateEntityCrc(data.entity);
        // this.documentsCrc = this.generateDocumentsCrc(data.documents);
    }

    static createFromStakeholderForSynchronization(data: StakeholderForSynchronization, email: string): NorthCapitalStakeholderParty | never {
        if (data === null) {
            throw new Error('Cannot create stakeholder party from null');
        }

        return new NorthCapitalStakeholderParty({
            profileId: data.profileId,
            party: {
                firstName: data.name.firstName,
                middleInitial: data.name?.middleName,
                lastName: data.name.lastName,
                domicile: NorthCapitalMapper.mapDomicile(data.domicile),
                dob: DateTime.format(DateTime.parse(data.dateOfBirth, 'YYYY-MM-DD'), "MM-DD-YYYY"),
                primAddress1: data.address.addressLine1,
                primAddress2: data.address?.addressLine2,
                primCity: data.address.city,
                primState: data.address.state,
                primZip: data.address.zip,
                primCountry: data.address.country,
                emailAddress: email,
                socialSecurityNumber: data.ssn ?? null,
                documents: data.idScan,
            },
            links: [
                {
                    mappingConfiguration: {
                        type: data.accountType === AccountType.CORPORATE ? MappedType.CORPORATE_ACCOUNT : MappedType.TRUST_ACCOUNT,
                        profileId: data.profileId,
                        externalId: data.accountId,
                        thisIsAccountEntry: true,
                    },
                    linkConfiguration: {
                        relatedEntryType: "IndivACParty",
                        linkType: "member",
                        primary_value: 0
                    }
                }
            ]
        });
    }

    private generateEntityCrc(data: NorthCapitalEntityStructure): string {
        const values = [
            data.entityName,
            data.primAddress1,
            data.primAddress2 ?? "",
            data.primCity,
            data.primState,
            data.primZip,
            data.primCountry,
            data.entityType ?? "",
        ];

        return CrcService.generateCrc(values);
    }


    getCrc(): string {
        return JSON.stringify({
            entity: this.entityCrc,
            documents: this.documentsCrc,
        });
    }

    getProfileId(): string {
        return this.data.profileId;
    }

    getEntityData(): DictionaryType {
        const entity = <DictionaryType>{};
        for (const [key, value] of Object.entries(this.data.entity)) {
            if (value !== null || value !== "") {
                entity[key] = value;
            }
        }

        return entity;
    }

    getLinksConfiguration(): NorthCapitalLink[] {
        return this.data.links;
    }

    isOutdatedEntity(crc: string): boolean {
        return this.entityCrc !== JSON.parse(crc)?.entity;
    }

    isOutdatedDocuments(crc: string): boolean {
        return this.documentsCrc !== JSON.parse(crc)?.documents;
    }

    getDocuments(): DocumentSchema[] {
        return this.data.documents;
    }

    private generateDocumentsCrc(documents: DocumentSchema[]): string {
        const values = documents.map(document => document.id);

        return CrcService.generateCrc(values);
    }
}
