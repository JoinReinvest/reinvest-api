import { ContainerInterface } from 'Container/Container';
import { Withdrawals } from 'Withdrawals/index';
import { WithdrawalsAgreementController } from 'Withdrawals/Port/Api/WithdrawalsAgreementController';
import { WithdrawalsController } from 'Withdrawals/Port/Api/WithdrawalsController';
import AbortFundsWithdrawalRequest from 'Withdrawals/UseCase/AbortFundsWithdrawalRequest';
import { CreateFundsWithdrawalAgreement } from 'Withdrawals/UseCase/CreateFundsWithdrawalAgreement';
import { CreateWithdrawalFundsRequest } from 'Withdrawals/UseCase/CreateWithdrawalFundsRequest';
import GetFundsWithdrawalAgreement from 'Withdrawals/UseCase/GetFundsWithdrawalAgreement';
import { GetFundsWithdrawalRequest } from 'Withdrawals/UseCase/GetFundsWithdrawalRequest';
import { RequestFundWithdrawal } from 'Withdrawals/UseCase/RequestFundWithdrawal';
import SignFundsWithdrawalRequestAgreement from 'Withdrawals/UseCase/SignFundsWithdrawalRequestAgreement';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';
import { WithdrawDividend } from 'Withdrawals/UseCase/WithdrawDividend';

export class PortsProvider {
  private config: Withdrawals.Config;

  constructor(config: Withdrawals.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(WithdrawalsController, [
      WithdrawalsQuery,
      CreateWithdrawalFundsRequest,
      GetFundsWithdrawalRequest,
      WithdrawDividend,
      AbortFundsWithdrawalRequest,
      RequestFundWithdrawal,
    ]);
    container.addSingleton(WithdrawalsAgreementController, [CreateFundsWithdrawalAgreement, GetFundsWithdrawalAgreement, SignFundsWithdrawalRequestAgreement]);
  }
}
