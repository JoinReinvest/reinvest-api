import {PhoneRepository} from "Identity/Adapter/Database/Repository/PhoneRepository";
import {SNSClient, PublishCommand} from "@aws-sdk/client-sns";
import {
    AdminSetUserMFAPreferenceCommand, AdminUpdateUserAttributesCommand, AttributeType,
    CognitoIdentityProviderClient, VerifiedAttributeType, VerifyUserAttributeCommand
} from "@aws-sdk/client-cognito-identity-provider";

export class PhoneController {
    public static getClassName = (): string => "PhoneController";
    private phoneRepository: PhoneRepository;

    constructor(phoneRepository: PhoneRepository) {
        this.phoneRepository = phoneRepository;
    }

    async setPhoneNumber(profileId: string, countryCode: string, phoneNumber: string): Promise<boolean> {
        // const client = new SNSClient({
        //     region: "eu-west-2"
        // });
        //
        // const command = new PublishCommand({
        //     Message: 'Your authentication code is 123456',
        //     PhoneNumber: "+48665699404"
        // });
        // const data = await client.send(command);
        // console.log({data});

        return true;
    }

    async verifyPhoneNumber(profileId: string, countryCode: string, phoneNumber: string, TOPTToken: string): Promise<boolean> {
        // const userId = "36a5fe47-42ee-4ed2-9600-27d7a02cc9d4";
        // const client = new CognitoIdentityProviderClient({region: "eu-west-2"});
        // const setPhoneNumberCommand = new AdminUpdateUserAttributesCommand({
        //     Username: userId,
        //     UserPoolId: process.env.CognitoUserPoolID as string,
        //     UserAttributes: [
        //         {
        //             Name: 'phone_number',
        //             Value: "+48665699404"
        //         } as AttributeType,
        //         {
        //             Name: 'phone_number_verified',
        //             Value: 'true'
        //         } as AttributeType,
        //     ]
        // });
        //
        // const phoneResponse = await client.send(setPhoneNumberCommand);
        // console.log({phoneResponse});

        return true;
    }
}