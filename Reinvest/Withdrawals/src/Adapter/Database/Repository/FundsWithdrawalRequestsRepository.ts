import { UUID } from 'HKEKTypes/Generics';
import { FundsWithdrawalRequest, FundsWithdrawalRequestSchema } from 'Reinvest/Withdrawals/src/Domain/FundsWithdrawalRequest';
import { WithdrawalsFundsRequestsStatuses } from 'Reinvest/Withdrawals/src/Domain/WithdrawalsFundsRequests';
import { WithdrawalFundsRequestCreate } from 'Reinvest/Withdrawals/src/UseCase/CreateWithdrawalFundsRequest';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { WithdrawalsDatabaseAdapterProvider, withdrawalsFundsRequestsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';

export class FundsWithdrawalRequestsRepository {
  private databaseAdapterProvider: WithdrawalsDatabaseAdapterProvider;
  private eventsPublisher: SimpleEventBus;

  constructor(databaseAdapterProvider: WithdrawalsDatabaseAdapterProvider, eventsPublisher: SimpleEventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.eventsPublisher = eventsPublisher;
  }

  public static getClassName = (): string => 'FundsWithdrawalRequestsRepository';

  async create(withdrawalFundsRequest: WithdrawalFundsRequestCreate) {
    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(withdrawalsFundsRequestsTable)
        .values({
          ...withdrawalFundsRequest,
          sharesJson: JSON.stringify(withdrawalFundsRequest.sharesJson),
          dividendsJson: JSON.stringify(withdrawalFundsRequest.dividendsJson),
        })
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create funds withdrawal request: ${error.message}`, error);

      return false;
    }
  }

  async assignAgreement(profileId: UUID, accountId: UUID, fundsWithdrawalRequest: FundsWithdrawalRequest) {
    const { id, agreementId } = fundsWithdrawalRequest.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(withdrawalsFundsRequestsTable)
        .set({
          agreementId,
        })
        .where('id', '=', id)
        .where('profileId', '=', profileId)
        .where('accountId', '=', accountId)
        .executeTakeFirst();

      return true;
    } catch (error: any) {
      console.error(`Cannot assign agreement to funds withdrawal request: ${error.message}`, error);

      return false;
    }
  }

  async getDraft(profileId: UUID, accountId: UUID) {
    try {
      const fundsWithdrawalRequest = await this.databaseAdapterProvider
        .provide()
        .selectFrom(withdrawalsFundsRequestsTable)
        .selectAll()
        .where('status', '=', WithdrawalsFundsRequestsStatuses.DRAFT)
        .where('profileId', '=', profileId)
        .where('accountId', '=', accountId)
        .castTo<FundsWithdrawalRequestSchema>()
        .executeTakeFirst();

      if (!fundsWithdrawalRequest) {
        return null;
      }

      return FundsWithdrawalRequest.create(fundsWithdrawalRequest);
    } catch (error: any) {
      console.error('Cannot get funds withdrawal request');

      return false;
    }
  }

  async updateStatus(fundsWithdrawalRequest: FundsWithdrawalRequest) {
    const { status } = fundsWithdrawalRequest.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(withdrawalsFundsRequestsTable)
        .set({
          status,
        })
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create funds withdrawal request: ${error.message}`, error);

      return false;
    }
  }

  async get(profileId: UUID, accountId: UUID) {
    try {
      const fundsWithdrawalRequest = await this.databaseAdapterProvider
        .provide()
        .selectFrom(withdrawalsFundsRequestsTable)
        .select([
          'accountValue',
          'adminDecisionReason',
          'agreementId',
          'dateCreated',
          'dateDecision',
          'dividendsJson',
          'eligibleFunds',
          'id',
          'investorWithdrawalReason',
          'numberOfShares',
          'payoutId',
          'profileId',
          'redemptionId',
          'sharesJson',
          'status',
          'totalDividends',
          'totalFee',
          'totalFunds',
          'accountId',
        ])
        .where('profileId', '=', profileId)
        .where('accountId', '=', accountId)
        .castTo<FundsWithdrawalRequestSchema>()
        .executeTakeFirst();

      if (!fundsWithdrawalRequest) {
        return null;
      }

      return FundsWithdrawalRequest.create(fundsWithdrawalRequest);
    } catch (error: any) {
      console.error('Cannot get funds withdrawal request');

      return false;
    }
  }

  async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }
}
