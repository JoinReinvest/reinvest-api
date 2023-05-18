import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';

import { ScheduledBy, Statuses } from '../Adapters/PostgreSQL/InvestmentsTypes';
import { InvestmentsRepository } from '../Adapters/Repository/InvestmentsRepository';

export type InvestmentCreate = {
  accountId: string;
  amount: number;
  id: string;
  profileId: string;
  scheduledBy: ScheduledBy;
  status: Statuses;
};

class CreateInvestment {
  static getClassName = (): string => 'CreateInvestment';

  private readonly investmentsRepository: InvestmentsRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(investmentsRepository: InvestmentsRepository, idGenerator: IdGeneratorInterface) {
    this.investmentsRepository = investmentsRepository;
    this.idGenerator = idGenerator;
  }

  async execute(profileId: string, accountId: string, money: number) {
    const id = this.idGenerator.createUuid();

    const investment: InvestmentCreate = {
      id,
      profileId,
      accountId,
      amount: money,
      scheduledBy: ScheduledBy.DIRECT,
      status: Statuses.IN_PROGRESS,
    };
    const status = this.investmentsRepository.create(investment);

    if (!status) {
      return false;
    }

    return id;
  }
}

export default CreateInvestment;
