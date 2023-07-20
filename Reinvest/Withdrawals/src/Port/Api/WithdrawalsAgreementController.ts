import { UUID } from 'HKEKTypes/Generics';
import { WithdrawalError } from 'Withdrawals/Domain/FundsWithdrawalRequest';
import { CreateFundsWithdrawalAgreement } from 'Withdrawals/UseCase/CreateFundsWithdrawalAgreement';
import GetFundsWithdrawalAgreement from 'Withdrawals/UseCase/GetFundsWithdrawalAgreement';
import SignFundsWithdrawalRequestAgreement from 'Withdrawals/UseCase/SignFundsWithdrawalRequestAgreement';

export class WithdrawalsAgreementController {
  private createFundsWithdrawalAgreementUseCase: CreateFundsWithdrawalAgreement;
  private getFundsWithdrawalAgreementUseCase: GetFundsWithdrawalAgreement;
  private signFundsWithdrawalRequestAgreementUseCase: SignFundsWithdrawalRequestAgreement;

  constructor(
    createFundsWithdrawalAgreementUseCase: CreateFundsWithdrawalAgreement,
    getFundsWithdrawalAgreementUseCase: GetFundsWithdrawalAgreement,
    signFundsWithdrawalRequestAgreementUseCase: SignFundsWithdrawalRequestAgreement,
  ) {
    this.createFundsWithdrawalAgreementUseCase = createFundsWithdrawalAgreementUseCase;
    this.getFundsWithdrawalAgreementUseCase = getFundsWithdrawalAgreementUseCase;
    this.signFundsWithdrawalRequestAgreementUseCase = signFundsWithdrawalRequestAgreementUseCase;
  }

  static getClassName = () => 'WithdrawalsAgreementController';

  async createFundsWithdrawalAgreement(profileId: UUID, accountId: UUID, portfolioId: UUID): Promise<WithdrawalError | null> {
    try {
      await this.createFundsWithdrawalAgreementUseCase.execute(profileId, accountId, portfolioId);

      return null;
    } catch (error: any) {
      if (Object.values(WithdrawalError).includes(error.message)) {
        return error.message;
      }

      console.error(`Error creating withdrawal funds request for account ${accountId}`, error);

      return WithdrawalError.UNKNOWN_ERROR;
    }
  }

  async getFundsWithdrawalAgreement(profileId: UUID, accountId: UUID) {
    return this.getFundsWithdrawalAgreementUseCase.execute(profileId, accountId);
  }

  async signFundsWithdrawalAgreement(profileId: UUID, accountId: UUID, clientIp: string): Promise<WithdrawalError | null> {
    try {
      await this.signFundsWithdrawalRequestAgreementUseCase.execute(profileId, accountId, clientIp);

      return null;
    } catch (error: any) {
      if (Object.values(WithdrawalError).includes(error.message)) {
        return error.message;
      }

      console.error(`Error signing withdrawal funds agreement for account ${accountId}`, error);

      return WithdrawalError.UNKNOWN_ERROR;
    }
  }
}
