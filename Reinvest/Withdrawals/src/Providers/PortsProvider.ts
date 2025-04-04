import { ContainerInterface } from 'Container/Container';
import { Withdrawals } from 'Withdrawals/index';
import { WithdrawalsAgreementController } from 'Withdrawals/Port/Api/WithdrawalsAgreementController';
import { WithdrawalsController } from 'Withdrawals/Port/Api/WithdrawalsController';
import AbortFundsWithdrawalRequest from 'Withdrawals/UseCase/AbortFundsWithdrawalRequest';
import AcceptWithdrawalRequests from 'Withdrawals/UseCase/AcceptWithdrawalRequests';
import { CreateFundsWithdrawalAgreement } from 'Withdrawals/UseCase/CreateFundsWithdrawalAgreement';
import CreateWithdrawal from 'Withdrawals/UseCase/CreateWithdrawal';
import { CreateWithdrawalFundsRequest } from 'Withdrawals/UseCase/CreateWithdrawalFundsRequest';
import GetFundsWithdrawalAgreement from 'Withdrawals/UseCase/GetFundsWithdrawalAgreement';
import { FundsWithdrawalRequestsQuery } from 'Withdrawals/UseCase/FundsWithdrawalRequestsQuery';
import RejectWithdrawalRequests from 'Withdrawals/UseCase/RejectWithdrawalRequests';
import { RequestFundWithdrawal } from 'Withdrawals/UseCase/RequestFundWithdrawal';
import SignFundsWithdrawalRequestAgreement from 'Withdrawals/UseCase/SignFundsWithdrawalRequestAgreement';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';
import { WithdrawDividend } from 'Withdrawals/UseCase/WithdrawDividend';
import { PushWithdrawalsDocumentCreation } from 'Withdrawals/UseCase/PushWithdrawalsDocumentCreation';
import { MarkWithdrawalAsCompleted } from 'Withdrawals/UseCase/MarkWithdrawalAsCompleted';

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
      FundsWithdrawalRequestsQuery,
      WithdrawDividend,
      AbortFundsWithdrawalRequest,
      RequestFundWithdrawal,
      CreateWithdrawal,
      AcceptWithdrawalRequests,
      RejectWithdrawalRequests,
      PushWithdrawalsDocumentCreation,
      MarkWithdrawalAsCompleted,
    ]);
    container.addSingleton(WithdrawalsAgreementController, [CreateFundsWithdrawalAgreement, GetFundsWithdrawalAgreement, SignFundsWithdrawalRequestAgreement]);
  }
}
