import {ProfileForSynchronization} from "Registration/Domain/Model/Profile";
import {CrcService} from "Registration/IntegrationLogic/Service/CrcService";
import {DomicileMapper} from "Registration/Domain/VendorModel/NorthCapital/DomicileMapper";
import {MainPartyType} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes";
import DateTime from "date-and-time";

export class MainParty {
    private data: MainPartyType;
    private crc: string;

    constructor(data: MainPartyType) {
        this.data = data;
        this.crc = this.generateCrc(data);
    }

    static createFromProfileForSynchronization(data: ProfileForSynchronization, email: string): MainParty | never {
        if (data === null) {
            throw new Error('Cannot create Party from null');
        }

        return new MainParty({
            firstName: data.firstName,
            middleInitial: data?.middleName,
            lastName: data.lastName,
            domicile: DomicileMapper.mapDomicile(data.domicile),
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
        });
    }

    getData(): MainPartyType {
        return this.data;
    }

    private generateCrc(data: MainPartyType): string {
        const values = [
            data.domicile,
            data.firstName,
            `${data.middleInitial}`,
            data.lastName,
            data.dob,
            data.primAddress1,
            `${data.primAddress2}`,
            data.primCity,
            data.primState,
            data.primZip,
            data.primCountry,
            data.emailAddress,
            data.documents?.map((document) => document.id).join(",") ?? "",
        ];

        return CrcService.generateCrc(values);
    }

    getEmail(): string {
        return this.data.emailAddress;
    }

    getLastName() {
        return this.data.lastName;
    }

    getCrc(): string {
        return this.crc;
    }
}
