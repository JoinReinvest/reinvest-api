import {CrcService} from "Registration/Domain/CrcService";
import {
    NorthCapitalLink,
    NorthCapitalCompanyAccountType,
    NorthCapitalCompanyAccountStructure
} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes";

import {CompanyAccountForSynchronization} from "Registration/Domain/Model/Account";
import {NorthCapitalMapper} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalMapper";
import {MappedType} from "Registration/Domain/Model/Mapping/MappedType";
import {DictionaryType} from "HKEKTypes/Generics";

export class NorthCapitalCompanyAccount {
    private readonly data: NorthCapitalCompanyAccountType;
    private accountCrc: string;


    constructor(data: NorthCapitalCompanyAccountType) {
        this.data = data;
        this.accountCrc = this.generateAccountCrc(data.account);
    }

    static createFromCompanyAccountForSynchronization(data: CompanyAccountForSynchronization): NorthCapitalCompanyAccount | never {
        if (data === null) {
            throw new Error('Cannot create company account from null');
        }

        const ownerName = [data.ownerName.firstName, data.ownerName?.middleName, data.ownerName.lastName]
            .filter((value?: string) => value !== null && value !== "")
            .join(" ");

        return new NorthCapitalCompanyAccount({
            profileId: data.profileId,
            account: {
                accountRegistration: ownerName,
                type: "Entity",
                entityType: NorthCapitalMapper.mapCompanyType(data.companyType.type),
                streetAddress1: data.address.addressLine1,
                streetAddress2: data.address?.addressLine2,
                city: data.address.city,
                state: data.address.state,
                zip: data.address.zip,
                country: data.address.country,
            },
            links: [
                {
                    mappingConfiguration: {
                        type: MappedType.PROFILE,
                        profileId: data.profileId,
                        externalId: data.profileId,
                    },
                    linkConfiguration: {
                        relatedEntryType: "IndivACParty",
                        linkType: "owner",
                        primary_value: 1
                    }
                }
            ]
        });
    }

    private generateAccountCrc(data: NorthCapitalCompanyAccountStructure): string {
        const values = [
            data.accountRegistration,
            data.entityType ?? "",
            data.streetAddress1,
            data.streetAddress2 ?? "",
            data.city,
            data.state,
            data.zip,
            data.country,
        ];

        return CrcService.generateCrc(values);
    }

    getCrc(): string {
        return JSON.stringify({
            account: this.accountCrc,
        });
    }

    getProfileId(): string {
        return this.data.profileId;
    }

    getAccountData(): DictionaryType {
        const account = <DictionaryType>{};
        for (const [key, value] of Object.entries(this.data.account)) {
            if (value !== null && value !== "") {
                account[key] = value;
            }
        }

        return account;
    }

    getLinksConfiguration(): NorthCapitalLink[] {
        return this.data.links;
    }

    isOutdatedAccount(crc: string): boolean {
        try {
            return this.accountCrc !== JSON.parse(crc)?.account;
        } catch (error: any) {
            console.warn(`Cannot parse crc: ${error.message}`);
            return true;
        }
    }
}
