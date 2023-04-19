import { IncentiveTokenRepository } from 'Identity/Adapter/Database/Repository/IncentiveTokenRepository';
import { IncentiveToken } from 'Identity/Domain/IncentiveToken';

export class IncentiveTokenController {
  public static getClassName = (): string => 'IncentiveTokenController';
  private incentiveTokenRepository: IncentiveTokenRepository;
  private webAppUrl: string;

  constructor(incentiveTokenRepository: IncentiveTokenRepository, webAppUrl: string) {
    this.incentiveTokenRepository = incentiveTokenRepository;
    this.webAppUrl = webAppUrl;
  }

  async isIncentiveTokenValid(token: string): Promise<boolean> {
    try {
      const incentiveToken = new IncentiveToken(token);

      return await this.incentiveTokenRepository.verifyIncentiveTokenUniqueness(incentiveToken);
    } catch (error: any) {
      console.log(error.message);

      return false;
    }
  }

  async getUserInvitationLink(userId: string): Promise<string | null> {
    const incentiveToken = await this.incentiveTokenRepository.getUserIncentiveToken(userId);

    if (!incentiveToken) {
      return null;
    }

    return `${this.webAppUrl}/referral/${incentiveToken.get()}`;
  }
}
