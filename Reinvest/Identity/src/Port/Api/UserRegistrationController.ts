import {UserRegistrationService} from "Identity/Service/UserRegistrationService";

export class UserRegistrationController {
    public static getClassName = (): string => "UserRegistrationController";
    private registrationService: UserRegistrationService;

    constructor(registrationService: UserRegistrationService) {
        this.registrationService = registrationService;
    }

    async registerUser(userId: string, email: string, incentiveToken: string | null): Promise<boolean> {
        try {
            await this.registrationService.registerUser(userId, email, incentiveToken);

            return true;
        } catch (error: any) {
            console.error(error.message);
            return false;
        }
    }
}