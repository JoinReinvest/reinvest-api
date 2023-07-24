import { UUID } from 'HKEKTypes/Generics';
import { FundsWithdrawalRequestsAgreementsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsAgreementsRepository';

export class MarkWithdrawalAgreementAsGenerated {
  static getClassName = (): string => 'MarkWithdrawalAgreementAsGenerated';
  private fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository;

  constructor(fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository) {
    this.fundsWithdrawalRequestsAgreementsRepository = fundsWithdrawalRequestsAgreementsRepository;
  }

  async execute(id: UUID): Promise<void> {
    const agreement = await this.fundsWithdrawalRequestsAgreementsRepository.getById(id);

    if (!agreement) {
      return;
    }

    agreement.markAsGenerated();
    await this.fundsWithdrawalRequestsAgreementsRepository.updateFundsWithdrawalRequestAgreement(agreement);
  }
}
