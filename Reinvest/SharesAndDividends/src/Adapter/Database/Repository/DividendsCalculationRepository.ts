import { DateTime } from 'Money/DateTime';
import { sadDividendsDeclarationsTable, SharesAndDividendsDatabaseAdapterProvider } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { DividendsDeclarationTable } from 'SharesAndDividends/Adapter/Database/SharesAndDividendsSchema';
import { DividendDeclaration, NumberOfSharesPerDay } from 'SharesAndDividends/Domain/Dividends/DividendDeclaration';

export class DividendsCalculationRepository {
  private databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'DividendsCalculationRepository';

  async getLastDeclarationDate(): Promise<DateTime | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadDividendsDeclarationsTable)
      .select(['calculatedToDate'])
      .orderBy('calculatedToDate', 'desc')
      .limit(1)
      .executeTakeFirst();

    return !data ? null : DateTime.from(data.calculatedToDate);
  }

  async storeDividendDeclaration(dividendDeclaration: DividendDeclaration) {
    const { numberOfShares: numberOfSharesJson, ...schema } = dividendDeclaration.toObject();
    const values = <DividendsDeclarationTable>{
      ...schema,
      numberOfSharesJson,
    };

    await this.databaseAdapterProvider.provide().insertInto(sadDividendsDeclarationsTable).values(values).execute();
  }

  async getDividendDeclarations(): Promise<DividendDeclaration[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadDividendsDeclarationsTable)
      .selectAll()
      .orderBy('calculatedFromDate', 'asc')
      .execute();

    return data.map((declaration: DividendsDeclarationTable) => {
      const { numberOfSharesJson, ...schema } = declaration;

      return DividendDeclaration.restore({
        ...schema,
        numberOfShares: <NumberOfSharesPerDay>numberOfSharesJson,
      });
    });
  }

  async getDividendDeclarationByDate(declarationDate: DateTime): Promise<DividendDeclaration | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadDividendsDeclarationsTable)
      .selectAll()
      // @ts-ignore
      .where('calculatedToDate', '=', declarationDate.toIsoDate())
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    const { numberOfSharesJson, ...schema } = data;

    return DividendDeclaration.restore({
      ...schema,
      numberOfShares: <NumberOfSharesPerDay>numberOfSharesJson,
    });
  }
}
