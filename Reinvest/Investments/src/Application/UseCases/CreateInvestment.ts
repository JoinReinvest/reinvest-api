import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { InvestmentStatus, ScheduledBy } from 'Investments/Domain/Investments/Types';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import TradeId from 'Investments/Infrastructure/ValueObject/TradeId';
import type { Money } from 'Money/Money';

export type InvestmentCreate = {
  accountId: string;
  bankAccountId: string;
  id: string;
  parentId: string | null;
  portfolioId: string;
  profileId: string;
  scheduledBy: ScheduledBy;
  status: InvestmentStatus;
  tradeId: string;
};

class CreateInvestment {
  private readonly investmentsRepository: InvestmentsRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(investmentsRepository: InvestmentsRepository, idGenerator: IdGeneratorInterface) {
    this.investmentsRepository = investmentsRepository;
    this.idGenerator = idGenerator;
  }

  static getClassName = (): string => 'CreateInvestment';

  async execute(portfolioId: string, profileId: string, accountId: string, bankAccountId: string, money: Money, parentId: string | null) {
    const id = this.idGenerator.createUuid();

    const tradeIdSize = TradeId.getTradeIdSize();

    const investment: InvestmentCreate = {
      id,
      portfolioId,
      profileId,
      bankAccountId,
      accountId,
      scheduledBy: ScheduledBy.DIRECT,
      status: InvestmentStatus.WAITING_FOR_SUBSCRIPTION_AGREEMENT,
      tradeId: this.idGenerator.createNumericId(tradeIdSize),
      parentId,
    };
    const status = this.investmentsRepository.create(investment, money);

    if (!status) {
      return false;
    }

    return id;
  }
}

export default CreateInvestment;
