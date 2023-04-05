import {CrcService} from "Registration/Domain/CrcService";
import {
    NorthCapitalIndividualAccountType,
    NorthCapitalIndividualExtendedMainPartyType,
    NorthCapitalIndividualAccountStructure, NorthCapitalLink
} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes";

import {IndividualAccountForSynchronization} from "Registration/Domain/Model/Account";
import {NorthCapitalMapper} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalMapper";
import {MappedType} from "Registration/Domain/Model/Mapping/MappedType";

export class NorthCapitalIndividualAccount {
    private readonly data: NorthCapitalIndividualAccountType;
    private accountCrc: string;
    private partyCrc: string;


    constructor(data: NorthCapitalIndividualAccountType) {
        this.data = data;
        this.accountCrc = this.generateAccountCrc(data.account);
        this.partyCrc = this.generateParty(data.extendedParty);
    }

    static createFromIndividualAccountForSynchronization(data: IndividualAccountForSynchronization): NorthCapitalIndividualAccount | never {
        if (data === null) {
            throw new Error('Cannot create individual account from null');
        }

        const fullName = [data.name.firstName, data.name?.middleName, data.name.lastName]
            .filter((value?: string) => value !== null && value !== "")
            .join(" ");

        return new NorthCapitalIndividualAccount({
            profileId: data.profileId,
            extendedParty: {
                occupation: data.title ?? null,
                empStatus: NorthCapitalMapper.mapEmploymentStatus(data.employmentStatus),
                empName: data.nameOfEmployer ?? null,
                householdNetworth: data.netIncome ?? null,
                currentHouseholdIncome: data.netWorth ?? null,
            },
            account: {
                accountRegistration: fullName,
                type: "Individual",
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

    private generateAccountCrc(data: NorthCapitalIndividualAccountType['account']): string {
        const values = [
            data.accountRegistration,
            data.streetAddress1,
            data.streetAddress2 ?? "",
            data.city,
            data.state,
            data.zip,
            data.country,
        ];

        return CrcService.generateCrc(values);
    }

    private generateParty(data: NorthCapitalIndividualAccountType['extendedParty']): string {
        const values = [
            data.occupation ?? "",
            data.empStatus ?? "",
            data.empName ?? "",
            data.householdNetworth ?? "",
            data.currentHouseholdIncome ?? "",
        ];

        return CrcService.generateCrc(values);
    }

    getCrc(): string {
        return JSON.stringify({
            account: this.accountCrc,
            party: this.partyCrc,
        });
    }

    getProfileId(): string {
        return this.data.profileId;
    }

    getPartyData(): NorthCapitalIndividualExtendedMainPartyType {
        return this.data.extendedParty;
    }

    getAccountData(): NorthCapitalIndividualAccountStructure {
        return this.data.account;
    }

    getLinksConfiguration(): NorthCapitalLink[] {
        return this.data.links;
    }

    isOutdatedAccount(crc: string): boolean {
        return this.accountCrc !== JSON.parse(crc)?.account;
    }

    isOutdatedParty(crc: string): boolean {
        return this.partyCrc !== JSON.parse(crc)?.party;
    }
}
