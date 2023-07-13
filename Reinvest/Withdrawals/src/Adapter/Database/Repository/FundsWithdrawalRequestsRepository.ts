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

  async assignAgreement(fundsWithdrawalRequest: FundsWithdrawalRequest) {
    const { id, agreementId } = fundsWithdrawalRequest.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(withdrawalsFundsRequestsTable)
        .set({
          agreementId,
        })
        .where('id', '=', id)
        .executeTakeFirst();

      return true;
    } catch (error: any) {
      console.error(`Cannot assign agreement to funds withdrawal request: ${error.message}`, error);

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
        .where('id', '=', fundsWithdrawalRequest.getId())
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create funds withdrawal request: ${error.message}`, error);

      return false;
    }
  }

  async accept(fundsWithdrawalRequest: FundsWithdrawalRequest): Promise<boolean> {
    const { status, dateDecision } = fundsWithdrawalRequest.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(withdrawalsFundsRequestsTable)
        .set({
          status,
          dateDecision,
        })
        .where('id', '=', fundsWithdrawalRequest.getId())
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create funds withdrawal request: ${error.message}`, error);

      return false;
    }
  }

  async reject(fundsWithdrawalRequest: FundsWithdrawalRequest): Promise<boolean> {
    const { status, dateDecision, adminDecisionReason } = fundsWithdrawalRequest.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(withdrawalsFundsRequestsTable)
        .set({
          status,
          dateDecision,
          adminDecisionReason,
        })
        .where('id', '=', fundsWithdrawalRequest.getId())
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create funds withdrawal request: ${error.message}`, error);

      return false;
    }
  }

  async get(profileId: UUID, accountId: UUID): Promise<FundsWithdrawalRequest | null> {
    try {
      const fundsWithdrawalRequest = await this.databaseAdapterProvider
        .provide()
        .selectFrom(withdrawalsFundsRequestsTable)
        .selectAll()
        .where('profileId', '=', profileId)
        .where('accountId', '=', accountId)
        .where('status', '!=', WithdrawalsFundsRequestsStatuses.ABORTED)
        .orderBy('dateCreated', 'desc')
        .castTo<FundsWithdrawalRequestSchema>()
        .executeTakeFirst();

      if (!fundsWithdrawalRequest) {
        return null;
      }

      return FundsWithdrawalRequest.create(fundsWithdrawalRequest);
    } catch (error: any) {
      console.error('Cannot get funds withdrawal request');

      return null;
    }
  }

  async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }

  async getPendingWithdrawalRequest(profileId: UUID, accountId: UUID) {
    const fundsWithdrawalRequest = await this.databaseAdapterProvider
      .provide()
      .selectFrom(withdrawalsFundsRequestsTable)
      .selectAll()
      .where('profileId', '=', profileId)
      .where('accountId', '=', accountId)
      .where('status', 'in', [WithdrawalsFundsRequestsStatuses.DRAFT, WithdrawalsFundsRequestsStatuses.REQUESTED])
      .castTo<FundsWithdrawalRequestSchema>()
      .executeTakeFirst();

    if (!fundsWithdrawalRequest) {
      return null;
    }

    return FundsWithdrawalRequest.create(fundsWithdrawalRequest);
  }

  async getRequestedFundsWithdrawalRequests(id: UUID): Promise<FundsWithdrawalRequest | null> {
    const fundsWithdrawalRequest = await this.databaseAdapterProvider
      .provide()
      .selectFrom(withdrawalsFundsRequestsTable)
      .where('id', '=', id)
      .where('status', '=', WithdrawalsFundsRequestsStatuses.REQUESTED)
      .castTo<FundsWithdrawalRequestSchema>()
      .executeTakeFirst();

    if (!fundsWithdrawalRequest) {
      return null;
    }

    return FundsWithdrawalRequest.create(fundsWithdrawalRequest);
  }
}
