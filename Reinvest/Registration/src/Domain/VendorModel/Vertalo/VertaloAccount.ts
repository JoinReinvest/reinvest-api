import {CrcService} from "Registration/Domain/CrcService";
import {
    AccountNameOwner,
} from "Registration/Domain/Model/Account";
import {VertaloAccountStructure} from "Registration/Domain/VendorModel/Vertalo/VertaloTypes";

export class VertaloAccount {
    private readonly data: VertaloAccountStructure;
    private crc: string;


    constructor(data: VertaloAccountStructure) {
        this.data = data;
        this.crc = this.generateCrc(data);
    }

    static createAccount(data: AccountNameOwner, email: string): VertaloAccount | never {
        if (data === null) {
            throw new Error('Cannot create account from null');
        }

        const fullName = [data.firstName, data?.middleName, data.lastName]
            .filter((value?: string) => value !== null && value !== "")
            .join(" ");

        return new VertaloAccount({
            email,
            name: fullName
        });
    }

    private generateCrc(data: VertaloAccountStructure): string {
        const values = [
            data.name,
        ];

        return CrcService.generateCrc(values);
    }

    getCrc(): string {
        return this.crc;
    }

    getData(): VertaloAccountStructure {
        return this.data;
    }
}
