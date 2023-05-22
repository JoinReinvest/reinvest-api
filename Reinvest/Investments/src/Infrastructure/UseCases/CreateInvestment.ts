import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import type { Money } from 'Money/Money';

import { InvestmentStatus, ScheduledBy } from '../../Domain/Investments/Types';
import { InvestmentsRepository } from '../Adapters/Repository/InvestmentsRepository';

export type InvestmentCreate = {
  accountId: string;
  bankAccountId: string;
  id: string;
  profileId: string;
  scheduledBy: ScheduledBy;
  status: InvestmentStatus;
};

class CreateInvestment {
  static getClassName = (): string => 'CreateInvestment';

  private readonly investmentsRepository: InvestmentsRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(investmentsRepository: InvestmentsRepository, idGenerator: IdGeneratorInterface) {
    this.investmentsRepository = investmentsRepository;
    this.idGenerator = idGenerator;
  }

  async execute(profileId: string, accountId: string, bankAccountId: string, money: Money) {
    const id = this.idGenerator.createUuid();

    const investment: InvestmentCreate = {
      id,
      profileId,
      bankAccountId,
      accountId,
      scheduledBy: ScheduledBy.DIRECT,
      status: InvestmentStatus.WAITING_FOR_SUBSCRIPTION_AGREEMENT,
    };
    const status = this.investmentsRepository.create(investment, money);

    if (!status) {
      return false;
    }

    return id;
  }
}

export default CreateInvestment;
