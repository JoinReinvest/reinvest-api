import { UUID } from 'HKEKTypes/Generics';
import { InvestmentCreated, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { DateTime } from 'Money/DateTime';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

class StartInvestment {
  private readonly investmentsRepository: InvestmentsRepository;

  constructor(investmentsRepository: InvestmentsRepository) {
    this.investmentsRepository = investmentsRepository;
  }

  static getClassName = (): string => 'StartInvestment';

  async execute(profileId: UUID, investmentId: UUID, approveFees: boolean, ip: string) {
    const investment = await this.investmentsRepository.getInvestmentByProfileAndId(profileId, investmentId);

    if (!investment) {
      return false;
    }

    if (approveFees) {
      investment.approveFee(ip);
    }

    const isStarted = investment.startInvestment();

    if (!isStarted) {
      return false;
    }

    const investmentData = investment.toObject();

    const events: DomainEvent[] = [
      <InvestmentCreated>{
        id: investmentData.id,
        kind: TransactionEvents.INVESTMENT_CREATED,
        date: DateTime.now().toDate(),
        data: {
          profileId,
          accountId: investmentData.accountId,
          portfolioId: investmentData.portfolioId,
          parentId: investmentData.parentId,
          amount: investmentData.amount.getAmount(),
        },
      },
      storeEventCommand(profileId, 'InvestmentProcessStarted', {
        accountId: investmentData.accountId,
        amount: investmentData.amount.getAmount(),
        tradeId: investmentData.tradeId,
        origin: investmentData.origin,
        investmentId: investmentData.id,
      }),
    ];

    return this.investmentsRepository.store(investment, events);
  }
}

export default StartInvestment;
