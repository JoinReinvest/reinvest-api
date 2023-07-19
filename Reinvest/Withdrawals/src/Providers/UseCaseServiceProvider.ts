import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { FundsWithdrawalRequestsAgreementsRepository } from 'Reinvest/Withdrawals/src/Adapter/Database/Repository/FundsWithdrawalRequestsAgreementsRepository';
import SignFundsWithdrawalRequestAgreement from 'Reinvest/Withdrawals/src/UseCase/SignFundsWithdrawalRequestAgreement';
import { DividendsRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/DividendsRequestsRepository';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalsDocumentsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsDocumentsRepository';
import { WithdrawalsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsRepository';
import { SharesAndDividendsService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';
import { Withdrawals } from 'Withdrawals/index';
import AbortFundsWithdrawalRequest from 'Withdrawals/UseCase/AbortFundsWithdrawalRequest';
import { CreateFundsWithdrawalAgreement } from 'Withdrawals/UseCase/CreateFundsWithdrawalAgreement';
import CreateWithdrawal from 'Withdrawals/UseCase/CreateWithdrawal';
import CreateWithdrawalDocument from 'Withdrawals/UseCase/CreateWithdrawalDocument';
import { CreateWithdrawalFundsRequest } from 'Withdrawals/UseCase/CreateWithdrawalFundsRequest';
import GenerateRedemptionForm from 'Withdrawals/UseCase/GenerateRedemptionForm';
import GetFundsWithdrawalAgreement from 'Withdrawals/UseCase/GetFundsWithdrawalAgreement';
import { GetFundsWithdrawalRequest } from 'Withdrawals/UseCase/GetFundsWithdrawalRequest';
import { MarkDocumentAsGenerated } from 'Withdrawals/UseCase/MarkDocumentAsGenerated';
import { RequestFundWithdrawal } from 'Withdrawals/UseCase/RequestFundWithdrawal';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';
import { WithdrawDividend } from 'Withdrawals/UseCase/WithdrawDividend';

export class UseCaseServiceProvider {
  private config: Withdrawals.Config;

  constructor(config: Withdrawals.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);

    container.addSingleton(WithdrawalsQuery, [SharesAndDividendsService]);
    container.addSingleton(CreateWithdrawalFundsRequest, [IdGenerator, FundsWithdrawalRequestsRepository, WithdrawalsQuery]);
    container.addSingleton(GetFundsWithdrawalRequest, [FundsWithdrawalRequestsRepository, WithdrawalsQuery]);
    container.addSingleton(CreateFundsWithdrawalAgreement, [IdGenerator, FundsWithdrawalRequestsRepository, FundsWithdrawalRequestsAgreementsRepository]);
    container.addSingleton(GetFundsWithdrawalAgreement, [FundsWithdrawalRequestsAgreementsRepository, FundsWithdrawalRequestsRepository]);
    container.addSingleton(WithdrawDividend, [SharesAndDividendsService, DividendsRequestsRepository, 'WithdrawalTransactionalAdapter', IdGenerator]);
    container.addSingleton(SignFundsWithdrawalRequestAgreement, [FundsWithdrawalRequestsAgreementsRepository, FundsWithdrawalRequestsRepository]);
    container.addSingleton(AbortFundsWithdrawalRequest, [FundsWithdrawalRequestsRepository]);
    container.addSingleton(RequestFundWithdrawal, [FundsWithdrawalRequestsRepository]);
    container.addSingleton(CreateWithdrawal, [
      WithdrawalsRepository,
      FundsWithdrawalRequestsRepository,
      DividendsRequestsRepository,
      CreateWithdrawalDocument,
      'WithdrawalTransactionalAdapter',
      IdGenerator,
    ]);
    container.addSingleton(GenerateRedemptionForm, [WithdrawalsDocumentsRepository]);
    container.addSingleton(MarkDocumentAsGenerated, [WithdrawalsDocumentsRepository]);
  }
}
