import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { RecurringInvestmentFrequency, RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { Money } from 'Money/Money';
import type { Schedule } from 'Reinvest/ApiGateway/src/Schema/Types/RecurringInvestments';

export type RecurringInvestmentCreate = {
  accountId: string;
  frequency: RecurringInvestmentFrequency;
  id: string;
  money: Money;
  portfolioId: string;
  profileId: string;
  startDate: string;
  status: RecurringInvestmentStatus;
};

class CreateRecurringInvestment {
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(recurringInvestmentsRepository: RecurringInvestmentsRepository, idGenerator: IdGeneratorInterface) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
    this.idGenerator = idGenerator;
  }

  static getClassName = (): string => 'CreateRecurringInvestment';

  async execute(portfolioId: string, profileId: string, accountId: string, money: Money, schedule: Schedule) {
    const id = this.idGenerator.createUuid();

    const recurringInvestment: RecurringInvestmentCreate = {
      id,
      portfolioId,
      profileId,
      accountId,
      money,
      startDate: schedule.startDate,
      frequency: schedule.frequency,
      status: RecurringInvestmentStatus.DRAFT,
    };
    const status = await this.recurringInvestmentsRepository.create(recurringInvestment);

    if (!status) {
      return false;
    }

    return true;
  }
}

export default CreateRecurringInvestment;
