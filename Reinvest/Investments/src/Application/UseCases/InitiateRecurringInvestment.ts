import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { RecurringInvestmentFrequency, RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { Money } from 'Money/Money';

export type RecurringInvestmentInitiate = {
  accountId: string;
  amount: number;
  dateCreated: Date;
  frequency: RecurringInvestmentFrequency;
  id: string;
  portfolioId: string;
  profileId: string;
  startDate: string;
  status: RecurringInvestmentStatus;
  subscriptionAgreementId: string | null;
};

class InitiateRecurringInvestment {
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(recurringInvestmentsRepository: RecurringInvestmentsRepository, idGenerator: IdGeneratorInterface) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
    this.idGenerator = idGenerator;
  }

  static getClassName = (): string => 'InitiateRecurringInvestment';

  async execute(accountId: string) {
    const recurringInvestment = await this.recurringInvestmentsRepository.get(accountId, RecurringInvestmentStatus.DRAFT);

    if (!recurringInvestment) {
      return false;
    }

    recurringInvestment?.updateStatus(RecurringInvestmentStatus.ACTIVE);

    const id = this.idGenerator.createUuid();

    const { portfolioId, profileId, schedule, amount, subscriptionAgreementId, dateCreated } = recurringInvestment.toObject();

    if (!subscriptionAgreementId) {
      return false;
    }

    const { startDate, frequency } = schedule.toObject();

    const data: RecurringInvestmentInitiate = {
      id,
      portfolioId,
      profileId,
      accountId,
      amount,
      startDate,
      frequency,
      subscriptionAgreementId,
      dateCreated,
      status: RecurringInvestmentStatus.ACTIVE,
    };

    const status = await this.recurringInvestmentsRepository.initiate(data);

    if (!status) {
      return false;
    }

    return true;
  }
}

export default InitiateRecurringInvestment;
