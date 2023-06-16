import { AdminGetUserCommand, AdminUpdateUserAttributesCommand, AttributeType, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

export type CognitoConfig = {
  region: string;
  userPoolID: string;
};

type CognitoUserType = {
  Enabled: boolean;
  UserAttributes: AttributeType[];
  UserStatus: string;
  Username: string;
};

export class CognitoService {
  public static getClassName = (): string => 'CognitoService';
  private config: CognitoConfig;

  constructor(config: CognitoConfig) {
    this.config = config;
  }

  private getClient(): CognitoIdentityProviderClient {
    return new CognitoIdentityProviderClient({ region: this.config.region });
  }

  async addVerifiedPhoneNumber(userId: string, phoneNumber: string): Promise<boolean> {
    const setPhoneNumberCommand = new AdminUpdateUserAttributesCommand({
      Username: userId,
      UserPoolId: this.config.userPoolID,
      UserAttributes: [
        {
          Name: 'phone_number',
          Value: phoneNumber,
        } as AttributeType,
        {
          Name: 'phone_number_verified',
          Value: 'true',
        } as AttributeType,
      ],
    });

    return this.sendAttributeUpdateCommand(setPhoneNumberCommand);
  }

  async isPhoneNumberCompleted(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserAttributes(userId);

      if (user === null) {
        return false;
      }

      const phoneNumberVerified = user.UserAttributes.find((attribute: AttributeType) => attribute.Name === 'phone_number_verified');

      return !!phoneNumberVerified && phoneNumberVerified.Value === 'true';
    } catch (error: any) {
      console.error(error);

      return false;
    }
  }

  async isEmailVerified(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserAttributes(userId);

      if (user === null) {
        return false;
      }

      const emailVerified = user.UserAttributes.find((attribute: AttributeType) => attribute.Name === 'email_verified');

      return !!emailVerified && emailVerified.Value === 'true';
    } catch (error: any) {
      console.error(error);

      return false;
    }
  }

  async getEmail(userId: string) {
    const user = await this.getUserAttributes(userId);

    if (user === null) {
      return false;
    }

    const email = user.UserAttributes.find((attribute: AttributeType) => attribute.Name === 'email');

    return email;
  }

  private async sendAttributeUpdateCommand(command: AdminUpdateUserAttributesCommand): Promise<boolean> {
    const client = this.getClient();
    await client.send(command);

    return true;
  }

  private async getUserAttributes(userId: string): Promise<CognitoUserType | null> {
    const client = this.getClient();
    const user = (await client.send(
      new AdminGetUserCommand({
        Username: userId,
        UserPoolId: this.config.userPoolID,
      }),
    )) as CognitoUserType;

    return user ?? null;
  }
}
