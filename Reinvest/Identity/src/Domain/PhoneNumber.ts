export class PhoneNumber {
    private phoneNumber: string;
    private countryCode: string;

    constructor(countryCode: string, phoneNumber: string) {
        this.countryCode = this.trim(countryCode);
        this.phoneNumber = this.trim(phoneNumber);
    }

    private trim(value: string): string {
        return value
            .replace('-', '')
            .replace(' ', '');
    }

    public getFullPhoneNumber() {
        return this.countryCode + this.phoneNumber;
    }

    getCountryCode() {
        return this.countryCode;
    }

    getPhoneNumber() {
        return this.phoneNumber;
    }
}