import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { SharesStatus } from 'SharesAndDividends/Domain/Shares';

export enum SharesChangeState {
  FUNDED = SharesStatus.FUNDED,
  FUNDING = SharesStatus.FUNDING,
  SETTLED = SharesStatus.SETTLED,
  REVOKED = SharesStatus.REVOKED,
}

export class ChangeSharesState {
  private sharesRepository: SharesRepository;

  constructor(sharesRepository: SharesRepository) {
    this.sharesRepository = sharesRepository;
  }

  static getClassName = () => 'ChangeSharesState';

  async execute(
    investmentId: string,
    state: SharesChangeState,
    data?: {
      shares: number;
      unitPrice: number;
    },
  ): Promise<void> {
    try {
      const shares = await this.sharesRepository.getSharesByInvestmentId(investmentId);

      if (!shares) {
        throw new Error(`Shares with investmentId ${investmentId} not found`);
      }

      if (state === SharesChangeState.FUNDING && data !== undefined) {
        shares.setFundingState(data.shares, data.unitPrice);
      }

      if (state === SharesChangeState.FUNDED) {
        shares.setFundedState();
      }

      if (state === SharesChangeState.SETTLED) {
        shares.setSettledState();
      }

      await this.sharesRepository.store(shares);
    } catch (error) {
      console.error('[ChangeSharesState]', investmentId, state, error);
    }
  }
}
