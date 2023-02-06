export class CognitoService {
    public static getClassName = (): string => "CognitoService";

    async setProfileAttribute(userId: string, profileId: string) {
        return true;
    }
}