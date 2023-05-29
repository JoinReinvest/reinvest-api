import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { IncentiveReward, RewardType } from 'SharesAndDividends/Domain/IncentiveReward';

export class CreateIncentiveReward {
  private dividendsRepository: DividendsRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(dividendsRepository: DividendsRepository, idGenerator: IdGeneratorInterface) {
    this.dividendsRepository = dividendsRepository;
    this.idGenerator = idGenerator;
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
  }
}
