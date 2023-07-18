import { PdfGenerated } from 'HKEKTypes/Pdf';
import DeactivateRecurringInvestment from 'Investments/Application/UseCases/DeactivateRecurringInvestment';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class DisableRecurringInvestmentCommandHandler implements EventHandler<PdfGenerated> {
  static getClassName = (): string => 'DisableRecurringInvestmentCommandHandler';
  private deactivateRecurringInvestmentUseCase: DeactivateRecurringInvestment;

  constructor(deactivateRecurringInvestmentUseCase: DeactivateRecurringInvestment) {
    this.deactivateRecurringInvestmentUseCase = deactivateRecurringInvestmentUseCase;
  }

  public async handle(event: DomainEvent): Promise<void> {
    if (!['DisableRecurringInvestment', 'DisableAllRecurringInvestment'].includes(event.kind)) {
      return;
    }

    if (event.kind === 'DisableRecurringInvestment') {
      const { profileId, accountId } = event.data;
      await this.deactivateRecurringInvestmentUseCase.execute(profileId, accountId);
    }

    if (event.kind === 'DisableAllRecurringInvestment') {
      const { profileId } = event.data;
      await this.deactivateRecurringInvestmentUseCase.deactivateAllUserRecurringInvestments(profileId);
    }
  }
}
