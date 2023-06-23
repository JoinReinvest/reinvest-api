import { UUID } from 'HKEKTypes/Generics';
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
    signFundsWithdrawalRequestAgreementUseCase: SignFundsWithdrawalRequestAgreement
    ) {
    this.createFundsWithdrawalAgreementUseCase = createFundsWithdrawalAgreementUseCase;
    this.getFundsWithdrawalAgreementUseCase = getFundsWithdrawalAgreementUseCase;
    this.signFundsWithdrawalRequestAgreementUseCase = signFundsWithdrawalRequestAgreementUseCase;
  }

  static getClassName = () => 'WithdrawalsAgreementController';

  async createFundsWithdrawalAgreement(profileId: UUID, accountId: UUID) {
    return this.createFundsWithdrawalAgreementUseCase.execute(profileId, accountId);
  }

  async getFundsWithdrawalAgreement(profileId: UUID, accountId: UUID) {
    return this.getFundsWithdrawalAgreementUseCase.execute(profileId, accountId,);
  }

  async signFundsWithdrawalAgreement(profileId: UUID, accountId: UUID, clientIp:string) {
    return this.signFundsWithdrawalRequestAgreementUseCase.execute(profileId, accountId, clientIp);
  }
}
