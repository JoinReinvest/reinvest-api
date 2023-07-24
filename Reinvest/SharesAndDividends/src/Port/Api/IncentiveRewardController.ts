import { RewardType } from 'SharesAndDividends/Domain/IncentiveReward';
import { CreateIncentiveReward } from 'SharesAndDividends/UseCase/CreateIncentiveReward';

export class IncentiveRewardController {
  private createIncentiveReward: CreateIncentiveReward;

  constructor(createIncentiveRewardUseCase: CreateIncentiveReward) {
    this.createIncentiveReward = createIncentiveRewardUseCase;
  }

  static getClassName = () => 'IncentiveRewardController';

  async createManuallyIncentiveReward(inviterProfileId: string, inviteeProfileId: string, whoShouldGetTheReward: RewardType): Promise<boolean> {
    try {
      await this.createIncentiveReward.execute(inviterProfileId, inviteeProfileId, whoShouldGetTheReward);

      return true;
    } catch (error: any) {
      console.warn(
        '[IncentiveRewardController] createManuallyIncentiveReward',
        {
          inviterProfileId,
          inviteeProfileId,
          whoShouldGetTheReward,
        },
        error,
      );

      return false;
    }
  }
}
