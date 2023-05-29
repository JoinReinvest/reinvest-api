import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { IncentiveReward } from 'SharesAndDividends/Domain/IncentiveReward';

export class CreateIncentiveReward {
  private dividendsRepository: DividendsRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(dividendsRepository: DividendsRepository, idGenerator: IdGeneratorInterface) {
    this.dividendsRepository = dividendsRepository;
    this.idGenerator = idGenerator;
  }

  static getClassName = () => 'CreateIncentiveReward';

  async execute(profileId: string): Promise<void> {
    const existingReward = await this.dividendsRepository.getIncentiveReward(profileId);

    if (existingReward) {
      throw new Error('Incentive reward already exists');
    }

    const id = this.idGenerator.createUuid();
    const reward = IncentiveReward.createAndAssignTo(id, profileId);

    await this.dividendsRepository.createIncentiveReward(reward);
  }
}
