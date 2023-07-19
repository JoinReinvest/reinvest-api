import { TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';

export class InvestmentStatusEventHandler {
  private investmentRepository: InvestmentsRepository;

  constructor(investmentRepository: InvestmentsRepository) {
    this.investmentRepository = investmentRepository;
  }

  static getClassName = (): string => 'InvestmentStatusEventHandler';

  async handle(event: TransactionEvent): Promise<void> {
    if (
      ![
        TransactionEvents.INVESTMENT_FUNDED,
        TransactionEvents.TRANSACTION_CANCELED,
        TransactionEvents.TRANSACTION_REVERTED,
        TransactionEvents.INVESTMENT_FINISHED,
        TransactionEvents.GRACE_PERIOD_ENDED,
      ].includes(event.kind)
    ) {
      return;
    }

    const investmentId = event.id;
    const investment = await this.investmentRepository.getByInvestmentId(investmentId);

    if (!investment) {
      return;
    }

    switch (event.kind) {
      case TransactionEvents.INVESTMENT_FUNDED:
        investment.fund();
        await this.investmentRepository.store(investment);
        break;
      case TransactionEvents.TRANSACTION_CANCELED:
        investment.completeCancellation();
        await this.investmentRepository.store(investment);
        break;
      case TransactionEvents.TRANSACTION_REVERTED:
        if (investment.revert()) {
          await this.investmentRepository.store(investment, [
            storeEventCommand(investment.getProfileId(), 'InvestmentFailed', investment.forInvestmentEvent()),
          ]);
        }

        break;
      case TransactionEvents.INVESTMENT_FINISHED:
        console.log(`[${investmentId}] Investment completed`);

        if (investment.complete()) {
          await this.investmentRepository.store(investment, [
            storeEventCommand(investment.getProfileId(), 'InvestmentCompleted', investment.forInvestmentEvent()),
          ]);
        }

        break;
      case TransactionEvents.GRACE_PERIOD_ENDED:
        investment.settlingStarted();
        await this.investmentRepository.store(investment);
        break;
    }
  }
}
