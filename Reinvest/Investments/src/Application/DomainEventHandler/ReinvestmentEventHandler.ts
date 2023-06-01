import { SharesEventHandler } from 'Investments/Application/DomainEventHandler/SharesEventHandler';
import { ReinvestmentExecutor } from 'Investments/Application/ReinvestmentProcessManager/ReinvestmentExecutor';
import { ReinvestmentRepositoryInterface } from 'Investments/Application/Repository/ReinvestmentRepositoryInterface';
import { ReinvestmentEvent } from 'Investments/Domain/Reinvestments/ReinvestmentEvents';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';

export class ReinvestmentEventHandler implements EventHandler<ReinvestmentEvent> {
  private reinvestmentRepositoryInterface: ReinvestmentRepositoryInterface;
  private reinvestmentExecutor: ReinvestmentExecutor;
  private sharesEventHandler: SharesEventHandler;

  constructor(
    reinvestmentRepositoryInterface: ReinvestmentRepositoryInterface,
    reinvestmentExecutor: ReinvestmentExecutor,
    sharesEventHandler: SharesEventHandler,
  ) {
    this.reinvestmentRepositoryInterface = reinvestmentRepositoryInterface;
    this.reinvestmentExecutor = reinvestmentExecutor;
    this.sharesEventHandler = sharesEventHandler;
  }

  static getClassName = (): string => 'ReinvestmentEventHandler';

  async handle(event: ReinvestmentEvent): Promise<void> {
    try {
      const reinvestmentProcessManager = await this.reinvestmentRepositoryInterface.restoreReinvestment(event.id);

      if (reinvestmentProcessManager.handleEvent(event)) {
        await this.sharesEventHandler.handle(event);
        await this.reinvestmentRepositoryInterface.saveEvent(event);
      }

      await this.reinvestmentExecutor.execute(reinvestmentProcessManager);
    } catch (error) {
      console.error(error);
    }
  }
}
