import { InvestmentStatus } from 'Investments/Domain/Investments/Types';
import {
  InvestmentsDatabaseAdapterProvider,
  investmentsFeesTable,
  investmentsTable,
  subscriptionAgreementTable,
} from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';

export type InvestmentDetails = {
  accountId: string;
  bankAccountId: string;
  feeAmount: number | null;
  feeApproveDate: Date | null;
  investmentAmount: number;
  ip: string | null;
  portfolioId: string;
  profileId: string;
  status: InvestmentStatus;
  subscriptionAgreementId: string | null;
  subscriptionAgreementPdfDateCreated: Date | null;
  tradeId: string;
  unitPrice: number;
};

export class InvestmentsQueryRepository {
  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'InvestmentsQueryRepository';

  async getInvestmentDetailsForTransaction(investmentId: string): Promise<InvestmentDetails | null> {
    const investmentDetails = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentsTable)
      .fullJoin(subscriptionAgreementTable, `${subscriptionAgreementTable}.id`, `${investmentsTable}.subscriptionAgreementId`)
      .leftJoin(investmentsFeesTable, `${investmentsFeesTable}.investmentId`, `${investmentsTable}.id`)
      .select([
        `${investmentsTable}.amount as investmentAmount`,
        `${investmentsTable}.subscriptionAgreementId`,
        `${investmentsTable}.bankAccountId`,
        `${investmentsTable}.portfolioId`,
        `${investmentsTable}.status`,
        `${investmentsTable}.tradeId`,
        `${investmentsTable}.profileId`,
        `${investmentsTable}.accountId`,
        `${investmentsTable}.unitPrice`,
      ])
      .select([`${subscriptionAgreementTable}.signedByIP as ip`, `${subscriptionAgreementTable}.pdfDateCreated as subscriptionAgreementPdfDateCreated`])
      .select([`${investmentsFeesTable}.amount as feeAmount`, `${investmentsFeesTable}.approveDate as feeApproveDate`])
      .where(`${investmentsTable}.id`, '=', investmentId)
      .castTo<InvestmentDetails>()
      .executeTakeFirst();

    if (!investmentDetails) {
      return null;
    }

    return investmentDetails;
  }
}
