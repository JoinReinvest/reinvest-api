import {PhoneRegistrationService} from "Identity/Service/PhoneRegistrationService";
import {PhoneNumber} from "Identity/Domain/PhoneNumber";

export class PhoneController {
    public static getClassName = (): string => "PhoneController";
    private phoneRegistrationService: PhoneRegistrationService;

    constructor(phoneRegistrationService: PhoneRegistrationService) {
        this.phoneRegistrationService = phoneRegistrationService;
    }

    async setPhoneNumber(userId: string, countryCode: string, phoneNumber: string): Promise<boolean> {
        try {
            const phone = new PhoneNumber(countryCode, phoneNumber);
            return this.phoneRegistrationService.registerUnverifiedPhoneNumber(userId, phone);
        } catch (error: any) {
            console.error(error);
            return false;
        }
    }

    async verifyPhoneNumber(userId: string, countryCode: string, phoneNumber: string, TOPTToken: string): Promise<boolean> {
        try {
            const phone = new PhoneNumber(countryCode, phoneNumber);
            return this.phoneRegistrationService.verifyPhoneNumber(userId, phone, TOPTToken);
        } catch (error: any) {
            console.error(error);
            return false;
        }
    }
}