import { UUID } from 'HKEKTypes/Generics';
import { WithdrawalsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsRepository';

export class MarkWithdrawalAsCompleted {
  static getClassName = (): string => 'MarkWithdrawalAsCompleted';

  private readonly withdrawalsRepository: WithdrawalsRepository;

  constructor(withdrawalsRepository: WithdrawalsRepository) {
    this.withdrawalsRepository = withdrawalsRepository;
  }

  async execute(withdrawalId: UUID): Promise<void> {
    const withdrawal = await this.withdrawalsRepository.getById(withdrawalId);

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.markAsCompleted()) {
      await this.withdrawalsRepository.store(withdrawal);
    }
  }
}
