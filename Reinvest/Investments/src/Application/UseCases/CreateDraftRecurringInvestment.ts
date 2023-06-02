import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { RecurringInvestmentFrequency, RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { InvestmentsDatabase } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { Money } from 'Money/Money';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import type { Schedule } from 'Reinvest/ApiGateway/src/Schema/Types/RecurringInvestments';

export type RecurringInvestmentDraftCreate = {
  accountId: string;
  frequency: RecurringInvestmentFrequency;
  id: string;
  money: Money;
  portfolioId: string;
  profileId: string;
  startDate: string;
  status: RecurringInvestmentStatus;
};

class CreateDraftRecurringInvestment {
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;
  private readonly subscriptionAgreementRepository: SubscriptionAgreementRepository;
  private idGenerator: IdGeneratorInterface;
  private readonly transactionAdapter: TransactionalAdapter<InvestmentsDatabase>;

  constructor(
    recurringInvestmentsRepository: RecurringInvestmentsRepository,
    subscriptionAgreementRepository: SubscriptionAgreementRepository,
    idGenerator: IdGeneratorInterface,
    transactionAdapter: TransactionalAdapter<InvestmentsDatabase>,
  ) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
    this.subscriptionAgreementRepository = subscriptionAgreementRepository;
    this.idGenerator = idGenerator;
    this.transactionAdapter = transactionAdapter;
  }

  static getClassName = (): string => 'CreateDraftRecurringInvestment';

  async execute(portfolioId: string, profileId: string, accountId: string, money: Money, schedule: Schedule) {
    const alreadyExistedRecurringInvestmentDraft = await this.recurringInvestmentsRepository.get(accountId, RecurringInvestmentStatus.DRAFT);
    let status = true;

    if (alreadyExistedRecurringInvestmentDraft) {
      const id = alreadyExistedRecurringInvestmentDraft.getId();

      status = await this.transactionAdapter.transaction(`Delete recurring investment ${id} with subscription agreement if exist`, async () => {
        await this.recurringInvestmentsRepository.delete(accountId, profileId, id);
        await this.subscriptionAgreementRepository.findByInvestmentIdAndDelete(accountId, id);
      });
    }

    if (!status) {
      return false;
    }

    const id = this.idGenerator.createUuid();

    const recurringInvestment: RecurringInvestmentDraftCreate = {
      id,
      portfolioId,
      profileId,
      accountId,
      money,
      startDate: schedule.startDate,
      frequency: schedule.frequency,
      status: RecurringInvestmentStatus.DRAFT,
    };

    status = await this.recurringInvestmentsRepository.create(recurringInvestment);

    if (!status) {
      return false;
    }

    return true;
  }
}

export default CreateDraftRecurringInvestment;
