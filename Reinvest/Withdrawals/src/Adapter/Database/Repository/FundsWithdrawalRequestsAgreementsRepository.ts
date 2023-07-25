import { JSONObject, UUID } from 'HKEKTypes/Generics';
import { FundsRequestWithdrawalAgreement } from 'Reinvest/Withdrawals/src/Domain/FundsRequestWithdrawalAgreement';
import type { FundsWithdrawalAgreementAgreementCreate } from 'Reinvest/Withdrawals/src/UseCase/CreateFundsWithdrawalAgreement';
import { WithdrawalsDatabaseAdapterProvider, withdrawalsFundsRequestsAgreementsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';

export class FundsWithdrawalRequestsAgreementsRepository {
  private databaseAdapterProvider: WithdrawalsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: WithdrawalsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'FundsWithdrawalRequestsAgreementsRepository';

  async getAgreement(fundsRequestId: UUID) {
    const fundsRequestWithdrawalAgreement = await this.databaseAdapterProvider
      .provide()
      .selectFrom(withdrawalsFundsRequestsAgreementsTable)
      .select([
        'accountId',
        'contentFieldsJson',
        'dateCreated',
        'fundsRequestId',
        'id',
        'pdfDateCreated',
        'profileId',
        'signedAt',
        'signedByIP',
        'status',
        'templateVersion',
      ])
      .where('fundsRequestId', '=', fundsRequestId)
      .executeTakeFirst();

    if (!fundsRequestWithdrawalAgreement) {
      return null;
    }

    return FundsRequestWithdrawalAgreement.create(fundsRequestWithdrawalAgreement);
  }

  async updateFundsWithdrawalRequestAgreement(withdrawalFundsRequestAgreement: FundsRequestWithdrawalAgreement) {
    const id = withdrawalFundsRequestAgreement.getId();
    const { status, signedByIP, signedAt, pdfDateCreated, contentFieldsJson } = withdrawalFundsRequestAgreement.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(withdrawalsFundsRequestsAgreementsTable)
        .set({
          signedByIP,
          signedAt,
          pdfDateCreated,
          status,
          contentFieldsJson: <JSONObject>{ ...contentFieldsJson },
        })
        .where('id', '=', id)
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot update funds withdrawal request agreement: ${error.message}`, error);

      return false;
    }
  }

  async create(withdrawalFundsRequestAgreement: FundsWithdrawalAgreementAgreementCreate) {
    const { accountId, contentFieldsJson, dateCreated, fundsRequestId, id, profileId, status, templateVersion } = withdrawalFundsRequestAgreement;
    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(withdrawalsFundsRequestsAgreementsTable)
        .values({
          accountId,
          dateCreated,
          fundsRequestId,
          id,
          profileId,
          status,
          templateVersion,
          contentFieldsJson: <JSONObject>{ ...contentFieldsJson },
        })
        .onConflict(oc => oc.constraint('funds_request_id_unique').doNothing())
        .executeTakeFirst();

      return true;
    } catch (error: any) {
      console.error(`Cannot create funds withdrawal request agreement for funds request ${fundsRequestId}`, error);

      return false;
    }
  }

  async getById(id: UUID) {
    const fundsRequestWithdrawalAgreement = await this.databaseAdapterProvider
      .provide()
      .selectFrom(withdrawalsFundsRequestsAgreementsTable)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!fundsRequestWithdrawalAgreement) {
      return null;
    }

    return FundsRequestWithdrawalAgreement.create(fundsRequestWithdrawalAgreement);
  }
}
