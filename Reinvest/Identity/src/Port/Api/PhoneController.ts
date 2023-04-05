import {PhoneRegistrationService} from "Identity/Service/PhoneRegistrationService";
import {PhoneNumber} from "Identity/Domain/PhoneNumber";
import {CognitoService} from "Identity/Adapter/AWS/CognitoService";

export class PhoneController {
    public static getClassName = (): string => "PhoneController";
    private phoneRegistrationService: PhoneRegistrationService;
    private cognitoService: CognitoService;

    constructor(phoneRegistrationService: PhoneRegistrationService, cognitoService: CognitoService) {
        this.phoneRegistrationService = phoneRegistrationService;
        this.cognitoService = cognitoService;
    }

    async setPhoneNumber(userId: string, countryCode: string, phoneNumber: string, isSmsAllowed: boolean = true): Promise<boolean> {
        try {
            const phone = new PhoneNumber(countryCode, phoneNumber, isSmsAllowed);
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

    async isPhoneNumberCompleted(userId: string): Promise<boolean> {
        return this.cognitoService.isPhoneNumberCompleted(userId);
    }
}