import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { RecurringInvestment } from 'Investments/Domain/Investments/RecurringInvestment';
import { RecurringInvestmentFrequency, RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { InvestmentsDatabase } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';

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

  async execute(
    portfolioId: UUID,
    profileId: UUID,
    accountId: UUID,
    amount: Money,
    frequency: RecurringInvestmentFrequency,
    startDate: DateTime,
  ): Promise<boolean> {
    const alreadyExistedRecurringInvestmentDraft = await this.recurringInvestmentsRepository.getRecurringInvestment(
      profileId,
      accountId,
      RecurringInvestmentStatus.DRAFT,
    );

    if (alreadyExistedRecurringInvestmentDraft) {
      const id = alreadyExistedRecurringInvestmentDraft.getId();

      const status = await this.transactionAdapter.transaction(`Delete recurring investment ${id} with subscription agreement if exist`, async () => {
        await this.recurringInvestmentsRepository.delete(accountId, profileId, id);
        await this.subscriptionAgreementRepository.deleteByInvestmentId(accountId, id);
      });

      if (!status) {
        return false;
      }
    }

    const id = this.idGenerator.createUuid();
    const recurringInvestment = RecurringInvestment.create(id, profileId, accountId, portfolioId, frequency, startDate, amount);

    return this.recurringInvestmentsRepository.store(recurringInvestment);
  }
}

export default CreateDraftRecurringInvestment;
