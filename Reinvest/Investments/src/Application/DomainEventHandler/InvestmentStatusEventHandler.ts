import { TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';

export class InvestmentStatusEventHandler {
  private investmentRepository: InvestmentsRepository;

  constructor(investmentRepository: InvestmentsRepository) {
    this.investmentRepository = investmentRepository;
  }

  static getClassName = (): string => 'InvestmentStatusEventHandler';

  async handle(event: TransactionEvent): Promise<void> {
    if (![TransactionEvents.INVESTMENT_FUNDED, TransactionEvents.TRANSACTION_CANCELED, TransactionEvents.INVESTMENT_FINISHED].includes(event.kind)) {
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
      case TransactionEvents.INVESTMENT_FINISHED:
        investment.complete();
        await this.investmentRepository.store(investment);
        break;
    }
  }
}
