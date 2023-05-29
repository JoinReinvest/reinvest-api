import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { NotificationService } from 'SharesAndDividends/Adapter/Modules/NotificationService';
import { IncentiveReward, RewardType } from 'SharesAndDividends/Domain/IncentiveReward';

export class CreateIncentiveReward {
  private dividendsRepository: DividendsRepository;
  private idGenerator: IdGeneratorInterface;
  private notificationService: NotificationService;

  constructor(dividendsRepository: DividendsRepository, idGenerator: IdGeneratorInterface, notificationService: NotificationService) {
    this.dividendsRepository = dividendsRepository;
    this.idGenerator = idGenerator;
    this.notificationService = notificationService;
  }

  static getClassName = () => 'CreateIncentiveReward';

  async execute(inviterProfileId: string, inviteeProfileId: string, rewardType: RewardType): Promise<void> {
    const profileId = rewardType === 'INVITER' ? inviterProfileId : inviteeProfileId;
    const theOtherProfileId = rewardType === 'INVITER' ? inviteeProfileId : inviterProfileId;
    const existingReward = await this.dividendsRepository.getIncentiveReward(profileId, theOtherProfileId, rewardType);

    if (existingReward) {
      throw new Error('Incentive reward already exists');
    }

    const id = this.idGenerator.createUuid();
    const reward = IncentiveReward.createReward(id, profileId, theOtherProfileId, rewardType);

    await this.dividendsRepository.createIncentiveReward(reward);
    await this.notificationService.createRewardDividendReceivedNotification(profileId, reward);
  }
}
