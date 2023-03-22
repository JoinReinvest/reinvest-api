import {CrcService} from "Registration/Domain/CrcService";
import {IndividualAccountType} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes";

import {IndividualAccountForSynchronization} from "Registration/Domain/Model/Account";
import {NorthCapitalMapper} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalMapper";

export class IndividualAccount {
    private readonly data: IndividualAccountType;
    private readonly crc: string;

    constructor(data: IndividualAccountType) {
        this.data = data;
        this.crc = this.generateCrc(data);
    }

    static createFromIndividualAccountForSynchronization(data: IndividualAccountForSynchronization): IndividualAccount | never {
        if (data === null) {
            throw new Error('Cannot create individual account from null');
        }

        const fullName = [data.name.firstName, data.name?.middleName, data.name.lastName]
            .filter((value?: string) => value !== null && value !== "")
            .join(" ");

        return new IndividualAccount({
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
                domesticYN: "domestic_account",
                streetAddress1: data.address.addressLine1,
                streetAddress2: data.address?.addressLine2,
                city: data.address.city,
                state: data.address.state,
                zip: data.address.zip,
                country: data.address.country,
            },
        });
    }

    getData(): IndividualAccountType {
        return this.data;
    }

    private generateCrc(data: IndividualAccountType): string {
        const values = [
            data.profileId,
            data.extendedParty.occupation ?? "",
            data.extendedParty.empStatus ?? "",
            data.extendedParty.empName ?? "",
            data.extendedParty.householdNetworth ?? "",
            data.extendedParty.currentHouseholdIncome ?? "",
            data.account.accountRegistration,
            data.account.streetAddress1,
            data.account.streetAddress2 ?? "",
            data.account.city,
            data.account.state,
            data.account.zip,
            data.account.country,
        ];

        return CrcService.generateCrc(values);
    }

    getCrc(): string {
        return this.crc;
    }
}
