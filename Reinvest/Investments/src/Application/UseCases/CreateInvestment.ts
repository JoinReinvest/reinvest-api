import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import type { Money } from 'Money/Money';

import { InvestmentStatus, ScheduledBy } from '../../Domain/Investments/Types';
import { InvestmentsRepository } from '../../Infrastructure/Adapters/Repository/InvestmentsRepository';
import TradeId from '../../Infrastructure/ValueObject/TradeId';

export type InvestmentCreate = {
  accountId: string;
  bankAccountId: string;
  id: string;
  profileId: string;
  scheduledBy: ScheduledBy;
  status: InvestmentStatus;
  tradeId: string;
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

    const tradeIdSize = TradeId.getTradeIdSize();

    const investment: InvestmentCreate = {
      id,
      profileId,
      bankAccountId,
      accountId,
      scheduledBy: ScheduledBy.DIRECT,
      status: InvestmentStatus.WAITING_FOR_SUBSCRIPTION_AGREEMENT,
      tradeId: this.idGenerator.createNumericId(tradeIdSize),
    };
    const status = this.investmentsRepository.create(investment, money);

    if (!status) {
      return false;
    }

    return id;
  }
}

export default CreateInvestment;
