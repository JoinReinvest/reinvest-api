import {
    AdminUpdateUserAttributesCommand, AttributeType,
    CognitoIdentityProviderClient
} from "@aws-sdk/client-cognito-identity-provider";

export type CognitoConfig = {
    region: string,
    userPoolID: string
}


export class CognitoService {
    public static getClassName = (): string => "CognitoService";
    private config: CognitoConfig;

    constructor(config: CognitoConfig) {
        this.config = config;
    }

    private getClient(): CognitoIdentityProviderClient {
        return new CognitoIdentityProviderClient({region: this.config.region});
    }

    async setProfileAttribute(userId: string, profileId: string) {
        const setProfileCommand = new AdminUpdateUserAttributesCommand({
            Username: userId,
            UserPoolId: this.config.userPoolID,
            UserAttributes: [
                {
                    Name: 'custom:profile_id',
                    Value: profileId
                } as AttributeType
            ]
        });

        return this.sendAttributeUpdateCommand(setProfileCommand);
    }

    async addVerifiedPhoneNumber(userId: string, phoneNumber: string): Promise<boolean> {
        const setPhoneNumberCommand = new AdminUpdateUserAttributesCommand({
            Username: userId,
            UserPoolId: this.config.userPoolID,
            UserAttributes: [
                {
                    Name: 'phone_number',
                    Value: phoneNumber
                } as AttributeType,
                {
                    Name: 'phone_number_verified',
                    Value: 'true'
                } as AttributeType,
            ]
        });

        return this.sendAttributeUpdateCommand(setPhoneNumberCommand);
    }

    private async sendAttributeUpdateCommand(command: AdminUpdateUserAttributesCommand): Promise<boolean> {
        const client = this.getClient();
        const response = await client.send(command);

        return true;
    }
}