import { CreateIncentiveReward } from 'SharesAndDividends/UseCase/CreateIncentiveReward';

export class IncentiveRewardController {
  private createIncentiveRewardUseCase: CreateIncentiveReward;

  constructor(createIncentiveRewardUseCase: CreateIncentiveReward) {
    this.createIncentiveRewardUseCase = createIncentiveRewardUseCase;
  }

  static getClassName = () => 'IncentiveRewardController';

  async createManualIncentiveReward(profileId: string): Promise<boolean> {
    try {
      await this.createIncentiveRewardUseCase.execute(profileId);

      return true;
    } catch (error: any) {
      console.warn('[IncentiveRewardController] createManualIncentiveReward', { profileId }, error);

      return false;
    }
  }
}
