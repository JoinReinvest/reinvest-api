import {PhoneRepository} from "Identity/Adapter/Database/Repository/PhoneRepository";
import {SNSClient, PublishCommand} from "@aws-sdk/client-sns";
import {
    AdminSetUserMFAPreferenceCommand, AdminUpdateUserAttributesCommand, AttributeType,
    CognitoIdentityProviderClient, VerifiedAttributeType, VerifyUserAttributeCommand
} from "@aws-sdk/client-cognito-identity-provider";
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
        const phone = new PhoneNumber(countryCode, phoneNumber);

        return this.phoneRegistrationService.verifyPhoneNumber(userId, phone, TOPTToken);
    }
}