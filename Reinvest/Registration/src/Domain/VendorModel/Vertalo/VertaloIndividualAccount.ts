import {CrcService} from "Registration/Domain/CrcService";
import {IndividualAccountForSynchronization} from "Registration/Domain/Model/Account";
import {VertaloIndividualAccountStructure} from "Registration/Domain/VendorModel/Vertalo/VertaloTypes";

export class VertaloIndividualAccount {
    private readonly data: VertaloIndividualAccountStructure;
    private crc: string;


    constructor(data: VertaloIndividualAccountStructure) {
        this.data = data;
        this.crc = this.generateCrc(data);
    }

    static createFromIndividualAccountForSynchronization(data: IndividualAccountForSynchronization, email: string): VertaloIndividualAccount | never {
        if (data === null) {
            throw new Error('Cannot create individual account from null');
        }

        const fullName = [data.name.firstName, data.name?.middleName, data.name.lastName]
            .filter((value?: string) => value !== null && value !== "")
            .join(" ");

        return new VertaloIndividualAccount({
            email,
            name: fullName
        });
    }

    private generateCrc(data: VertaloIndividualAccountStructure): string {
        const values = [
            data.name,
        ];

        return CrcService.generateCrc(values);
    }

    getCrc(): string {
        return this.crc;
    }

    getData(): VertaloIndividualAccountStructure {
        return this.data;
    }
}
