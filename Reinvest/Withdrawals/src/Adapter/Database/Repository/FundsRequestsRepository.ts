import { UUID } from 'HKEKTypes/Generics';
import { FundsWithdrawalRequest, FundsWithdrawalRequestSchema } from 'Reinvest/Withdrawals/src/Domain/FundsWithdrawalRequest';
import { WithdrawalFundsRequestCreate } from 'Reinvest/Withdrawals/src/UseCase/CreateWithdrawalFundsRequest';
import { WithdrawalsDatabaseAdapterProvider, withdrawalsFundsRequestsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';

export class FundsRequestsRepository {
  private databaseAdapterProvider: WithdrawalsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: WithdrawalsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'FundsRequestsRepository';

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

  async get(profileId: UUID, accountId: UUID, id: UUID) {
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
        .where('id', '=', id)
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
}
