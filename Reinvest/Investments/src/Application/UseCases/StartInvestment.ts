import { UUID } from 'HKEKTypes/Generics';
import { InvestmentCreated, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';

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

    if (investment.isStartedInvestment()) {
      return true;
    }

    if (approveFees) {
      investment.approveFee(ip);
    }

    const subscriptionAgreementId = investment.getSubscriptionAgreementId();

    if (!subscriptionAgreementId) {
      return false;
    }

    const isStarted = investment.startInvestment();

    if (!isStarted) {
      return false;
    }

    const investmentData = investment.toObject();

    const events = [
      <InvestmentCreated>{
        id: investmentData.id,
        kind: TransactionEvents.INVESTMENT_CREATED,
        date: new Date(),
        data: {
          profileId,
          accountId: investmentData.accountId,
          portfolioId: investmentData.portfolioId,
          parentId: investmentData.parentId,
          amount: investmentData.amount,
        },
      },
      storeEventCommand(profileId, 'InvestmentProcessStarted', {
        accountId: investmentData.accountId,
        amount: investmentData.amount,
        tradeId: investmentData.tradeId,
        origin: investmentData.recurringInvestmentId ? 'Recurring investment' : 'Direct deposit',
        investmentId: investmentData.id,
      }),
    ];

    return this.investmentsRepository.updateInvestment(investment, approveFees, events);
  }
}

export default StartInvestment;
