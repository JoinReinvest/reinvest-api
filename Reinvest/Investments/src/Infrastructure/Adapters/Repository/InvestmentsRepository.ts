import { UUID } from 'HKEKTypes/Generics';
import { Fee } from 'Investments/Domain/Investments/Fee';
import { InvestmentsDatabaseAdapterProvider, investmentsFeesTable, investmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { InvestmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';
import { InvestmentSummary } from 'Investments/Infrastructure/ValueObject/InvestmentSummary';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { Pagination } from 'Reinvest/Investments/src/Application/Pagination';
import { Investment } from 'Reinvest/Investments/src/Domain/Investments/Investment';
import { InvestmentStatus, InvestmentSummarySchema } from 'Reinvest/Investments/src/Domain/Investments/Types';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import type { DomainEvent } from 'SimpleAggregator/Types';

import { FeesRepository } from './FeesRepository';

export class InvestmentsRepository {
  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;
  private feesRepository: FeesRepository;
  private eventsPublisher: SimpleEventBus;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider, feesRepository: FeesRepository, eventsPublisher: SimpleEventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.feesRepository = feesRepository;
    this.eventsPublisher = eventsPublisher;
  }

  public static getClassName = (): string => 'InvestmentsRepository';

  async getByInvestmentId(investmentId: string): Promise<Investment | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentsTable)
      .selectAll()
      .where(`${investmentsTable}.id`, '=', investmentId)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    const fee = await this.feesRepository.getFeeByInvestmentId(investmentId);

    return this.castToObject(data, fee);
  }

  async getInvestmentByProfileAndId(profileId: UUID, investmentId: UUID): Promise<Investment | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentsTable)
      .selectAll()
      .where(`${investmentsTable}.id`, '=', investmentId)
      .where(`${investmentsTable}.profileId`, '=', profileId)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    const fee = await this.feesRepository.getFeeByInvestmentId(investmentId);

    return this.castToObject(data, fee);
  }

  async listPaginatedInvestmentsWithoutFee(profileId: string, accountId: string, pagination: Pagination): Promise<Investment[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentsTable)
      .selectAll()
      .where(`profileId`, '=', profileId)
      .where(`accountId`, '=', accountId)
      .where('status', '!=', InvestmentStatus.ABORTED)
      .orderBy('dateCreated', 'desc')
      .limit(pagination.perPage)
      .offset(pagination.perPage * pagination.page)
      .execute();

    if (data.length === 0) {
      return [];
    }

    return data.map((investment: InvestmentsTable) => this.castToObject(investment, null));
  }

  async getAllInvestmentsWithoutFees(profileId: string, accountId: string): Promise<Investment[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentsTable)
      .selectAll()
      .where(`${investmentsTable}.profileId`, '=', profileId)
      .where(`${investmentsTable}.accountId`, '=', accountId)
      .execute();

    if (!data) {
      return [];
    }

    return data.map((investment: InvestmentsTable) => this.castToObject(investment, null));
  }

  async getInvestmentForSummary(investmentId: string): Promise<InvestmentSummary | null> {
    const investmentSummary = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentsTable)
      .leftJoin(investmentsFeesTable, `${investmentsFeesTable}.investmentId`, `${investmentsTable}.id`)
      .select([
        `${investmentsTable}.amount`,
        `${investmentsTable}.dateCreated`,
        `${investmentsTable}.id`,
        `${investmentsTable}.status`,
        `${investmentsTable}.subscriptionAgreementId`,
        `${investmentsTable}.tradeId`,
        `${investmentsTable}.bankAccountId`,
      ])
      .select([`${investmentsFeesTable}.amount as feeAmount`])
      .where(`${investmentsTable}.id`, '=', investmentId)
      .executeTakeFirst();

    if (!investmentSummary) {
      return null;
    }

    return InvestmentSummary.create(investmentSummary as InvestmentSummarySchema);
  }

  async getPendingInvestmentsIds(): Promise<UUID[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentsTable)
      .select(['id'])
      .where(`status`, 'in', [InvestmentStatus.IN_PROGRESS, InvestmentStatus.FUNDED, InvestmentStatus.CANCELING])
      .execute();

    if (!data) {
      return [];
    }

    return data.map(investment => <UUID>investment.id);
  }

  async store(investment: Investment, events: DomainEvent[] = []): Promise<boolean> {
    try {
      const data = this.castToTable(investment);
      await this.databaseAdapterProvider
        .provide()
        .insertInto(investmentsTable)
        .values(data)
        .onConflict(oc =>
          oc.column('id').doUpdateSet({
            dateUpdated: eb => eb.ref(`excluded.dateUpdated`),
            dateStarted: eb => eb.ref(`excluded.dateStarted`),
            status: eb => eb.ref(`excluded.status`),
            subscriptionAgreementId: eb => eb.ref(`excluded.subscriptionAgreementId`),
          }),
        )
        .execute();

      if (investment.getFee()) {
        await this.feesRepository.storeFee(investment.getFee()!);
      }

      if (events.length > 0) {
        await this.publishEvents(events);
      }

      return true;
    } catch (error: any) {
      console.error(`Cannot store investment ${investment.getId()}`, error);

      return false;
    }
  }

  async transferInvestments(toStore: Investment[]): Promise<void> {
    const data = toStore.map((investment: Investment) => this.castToTable(investment));

    await this.databaseAdapterProvider
      .provide()
      .insertInto(investmentsTable)
      .values(data)
      .onConflict(oc =>
        oc.column('id').doUpdateSet({
          accountId: eb => eb.ref(`excluded.accountId`),
          parentId: eb => eb.ref(`excluded.parentId`),
        }),
      )
      .execute();
  }

  async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }

  private async castToObjectWithFees(data: InvestmentsTable[]): Promise<Investment[]> {
    const investmentIds = data.map(investment => investment.id);

    if (investmentIds.length === 0) {
      return [];
    }

    const fees = await this.feesRepository.getFeesByInvestmentId(investmentIds);
    const investmentIdToFee: { [investmentId: UUID]: Fee } = {};

    for (const fee of fees) {
      investmentIdToFee[fee.getInvestmentId()] = fee;
    }

    return data.map((investment: InvestmentsTable) => this.castToObject(investment, investmentIdToFee[investment.id] ?? null));
  }

  private castToObject(data: InvestmentsTable, fee: Fee | null): Investment {
    return Investment.restore(
      {
        ...data,
        amount: Money.lowPrecision(data.amount),
        dateCreated: DateTime.from(data.dateCreated),
        dateStarted: data.dateStarted ? DateTime.from(data.dateStarted) : null,
        dateUpdated: DateTime.from(data.dateUpdated),
        // @ts-ignore
        unitPrice: Money.lowPrecision(parseInt(data.unitPrice)),
      },
      fee,
    );
  }

  private castToTable(object: Investment): InvestmentsTable {
    const schema = object.toObject();

    return {
      ...schema,
      amount: schema.amount.getAmount(),
      dateCreated: schema.dateCreated.toDate(),
      dateStarted: schema.dateStarted?.toDate() || null,
      dateUpdated: schema.dateUpdated.toDate(),
      unitPrice: schema.unitPrice.getAmount(),
    };
  }
}
