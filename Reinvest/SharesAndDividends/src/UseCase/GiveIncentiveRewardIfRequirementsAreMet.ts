import { UUID } from 'HKEKTypes/Generics';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { IdentityService } from 'SharesAndDividends/Adapter/Modules/IdentityService';
import { MINIMUM_INVESTMENT_AMOUNT_TO_GET_REWARD, RewardType } from 'SharesAndDividends/Domain/IncentiveReward';
import { CreateIncentiveReward } from 'SharesAndDividends/UseCase/CreateIncentiveReward';

export class GiveIncentiveRewardIfRequirementsAreMet {
  static getClassName = () => 'GiveIncentiveRewardIfRequirementsAreMet';

  private dividendsRepository: DividendsRepository;
  private identityService: IdentityService;
  private sharesRepository: SharesRepository;
  private createIncentiveRewardUseCase: CreateIncentiveReward;

  constructor(
    dividendsRepository: DividendsRepository,
    identityService: IdentityService,
    sharesRepository: SharesRepository,
    createIncentiveRewardUseCase: CreateIncentiveReward,
  ) {
    this.identityService = identityService;
    this.sharesRepository = sharesRepository;
    this.dividendsRepository = dividendsRepository;
    this.createIncentiveRewardUseCase = createIncentiveRewardUseCase;
  }

  async execute(inviteeProfileId: UUID): Promise<void> {
    const inviterProfileId = await this.identityService.getUserInviter(inviteeProfileId);

    if (!inviterProfileId) {
      return;
    }

    const userExistingIncentiveReward = await this.dividendsRepository.getIncentiveReward(inviteeProfileId, inviterProfileId, RewardType.INVITEE);

    if (userExistingIncentiveReward) {
      return;
    }

    const totalInvestments = await this.sharesRepository.getTotalInvestmentsAmount(inviteeProfileId);

    if (totalInvestments.isGreaterThan(MINIMUM_INVESTMENT_AMOUNT_TO_GET_REWARD) || totalInvestments.isEqual(MINIMUM_INVESTMENT_AMOUNT_TO_GET_REWARD)) {
      await this.createIncentiveRewardUseCase.execute(inviterProfileId, inviteeProfileId, RewardType.INVITER);
      await this.createIncentiveRewardUseCase.execute(inviterProfileId, inviteeProfileId, RewardType.INVITEE);
    }
  }
}
