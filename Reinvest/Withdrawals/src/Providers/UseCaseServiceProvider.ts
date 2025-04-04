import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { FundsWithdrawalRequestsAgreementsRepository } from 'Reinvest/Withdrawals/src/Adapter/Database/Repository/FundsWithdrawalRequestsAgreementsRepository';
import SignFundsWithdrawalRequestAgreement from 'Reinvest/Withdrawals/src/UseCase/SignFundsWithdrawalRequestAgreement';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DividendsRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/DividendsRequestsRepository';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalsDocumentsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsDocumentsRepository';
import { WithdrawalsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsRepository';
import { SharesAndDividendsService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';
import { WithdrawalDocumentsDataCollector } from 'Withdrawals/Adapter/Module/WithdrawalDocumentsDataCollector';
import { Withdrawals } from 'Withdrawals/index';
import AbortFundsWithdrawalRequest from 'Withdrawals/UseCase/AbortFundsWithdrawalRequest';
import AcceptWithdrawalRequests from 'Withdrawals/UseCase/AcceptWithdrawalRequests';
import { CreateFundsWithdrawalAgreement } from 'Withdrawals/UseCase/CreateFundsWithdrawalAgreement';
import CreatePayoutDocument from 'Withdrawals/UseCase/CreatePayoutDocument';
import CreateRedemptionFormDocument from 'Withdrawals/UseCase/CreateRedemptionFormDocument';
import CreateWithdrawal from 'Withdrawals/UseCase/CreateWithdrawal';
import { CreateWithdrawalFundsRequest } from 'Withdrawals/UseCase/CreateWithdrawalFundsRequest';
import { FundsWithdrawalRequestsQuery } from 'Withdrawals/UseCase/FundsWithdrawalRequestsQuery';
import GenerateWithdrawalDocument from 'Withdrawals/UseCase/GenerateWithdrawalDocument';
import GetFundsWithdrawalAgreement from 'Withdrawals/UseCase/GetFundsWithdrawalAgreement';
import { MarkDocumentAsGenerated } from 'Withdrawals/UseCase/MarkDocumentAsGenerated';
import { MarkWithdrawalAgreementAsGenerated } from 'Withdrawals/UseCase/MarkWithdrawalAgreementAsGenerated';
import { MarkWithdrawalAsCompleted } from 'Withdrawals/UseCase/MarkWithdrawalAsCompleted';
import { PushWithdrawalsDocumentCreation } from 'Withdrawals/UseCase/PushWithdrawalsDocumentCreation';
import RejectWithdrawalRequests from 'Withdrawals/UseCase/RejectWithdrawalRequests';
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

    container.addSingleton(WithdrawalsQuery, [SharesAndDividendsService, WithdrawalsRepository]);
    container.addSingleton(MarkWithdrawalAsCompleted, [WithdrawalsRepository]);
    container.addSingleton(CreateWithdrawalFundsRequest, [
      IdGenerator,
      FundsWithdrawalRequestsRepository,
      WithdrawalsQuery,
      SharesAndDividendsService,
      'WithdrawalTransactionalAdapter',
    ]);
    container.addSingleton(FundsWithdrawalRequestsQuery, [FundsWithdrawalRequestsRepository, WithdrawalsQuery, DividendsRequestsRepository]);
    container.addSingleton(CreateFundsWithdrawalAgreement, [
      IdGenerator,
      FundsWithdrawalRequestsRepository,
      FundsWithdrawalRequestsAgreementsRepository,
      WithdrawalDocumentsDataCollector,
    ]);
    container.addSingleton(GetFundsWithdrawalAgreement, [FundsWithdrawalRequestsAgreementsRepository, FundsWithdrawalRequestsRepository]);
    container.addSingleton(WithdrawDividend, [
      SharesAndDividendsService,
      DividendsRequestsRepository,
      'WithdrawalTransactionalAdapter',
      IdGenerator,
      SimpleEventBus,
    ]);
    container.addSingleton(SignFundsWithdrawalRequestAgreement, [FundsWithdrawalRequestsAgreementsRepository, FundsWithdrawalRequestsRepository]);
    container.addSingleton(AbortFundsWithdrawalRequest, [FundsWithdrawalRequestsRepository, SharesAndDividendsService, 'WithdrawalTransactionalAdapter']);
    container.addSingleton(RequestFundWithdrawal, [FundsWithdrawalRequestsRepository]);
    container.addSingleton(CreateWithdrawal, [
      WithdrawalsRepository,
      FundsWithdrawalRequestsRepository,
      DividendsRequestsRepository,
      'WithdrawalTransactionalAdapter',
      IdGenerator,
    ]);
    container.addSingleton(CreateRedemptionFormDocument, [
      WithdrawalsDocumentsRepository,
      WithdrawalsRepository,
      WithdrawalDocumentsDataCollector,
      FundsWithdrawalRequestsRepository,
    ]);
    container.addSingleton(CreatePayoutDocument, [
      WithdrawalsDocumentsRepository,
      WithdrawalsRepository,
      WithdrawalDocumentsDataCollector,
      DividendsRequestsRepository,
      FundsWithdrawalRequestsRepository,
    ]);
    container.addSingleton(GenerateWithdrawalDocument, [WithdrawalsDocumentsRepository]);
    container.addSingleton(MarkDocumentAsGenerated, [WithdrawalsDocumentsRepository, WithdrawalsRepository]);
    container.addSingleton(MarkWithdrawalAgreementAsGenerated, [FundsWithdrawalRequestsAgreementsRepository]);
    container.addSingleton(AcceptWithdrawalRequests, [FundsWithdrawalRequestsRepository, SharesAndDividendsService, 'WithdrawalTransactionalAdapter']);
    container.addSingleton(RejectWithdrawalRequests, [FundsWithdrawalRequestsRepository, SharesAndDividendsService, 'WithdrawalTransactionalAdapter']);
    container.addSingleton(PushWithdrawalsDocumentCreation, [SimpleEventBus]);
  }
}
