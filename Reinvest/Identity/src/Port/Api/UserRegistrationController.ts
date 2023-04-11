import { IncentiveToken } from 'Identity/Domain/IncentiveToken';
import { UserRegistrationService } from 'Identity/Service/UserRegistrationService';

export class UserRegistrationController {
  private registrationService: UserRegistrationService;

  constructor(registrationService: UserRegistrationService) {
    this.registrationService = registrationService;
  }

  public static getClassName = (): string => 'UserRegistrationController';

  async registerUser(userId: string, email: string, incentiveToken: string | null): Promise<boolean> {
    try {
      const inviterIncentiveToken = this.getIncentiveToken(userId, incentiveToken);
      await this.registrationService.registerUser(userId, email, inviterIncentiveToken);

      return true;
    } catch (error: any) {
      console.log(error.message);

      return false;
    }
  }

  private getIncentiveToken(userId: string, incentiveToken: string | null): IncentiveToken | null {
    try {
      return incentiveToken === null ? null : new IncentiveToken(incentiveToken);
    } catch (error: any) {
      console.warn(`Wrong format of incentive token. Incentive token skipped: ${incentiveToken} for user id: ${userId}`);

      return null;
    }
  }
}
