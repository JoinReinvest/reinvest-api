import { UUID } from 'HKEKTypes/Generics';
import { ReinvestmentExecutor } from 'Investments/Application/ReinvestmentProcessManager/ReinvestmentExecutor';
import { ReinvestmentRepositoryInterface } from 'Investments/Application/Repository/ReinvestmentRepositoryInterface';

export class PushReinvestment {
  private reinvestmentRepositoryInterface: ReinvestmentRepositoryInterface;
  private reinvestmentExecutor: ReinvestmentExecutor;

  constructor(reinvestmentRepositoryInterface: ReinvestmentRepositoryInterface, reinvestmentExecutor: ReinvestmentExecutor) {
    this.reinvestmentRepositoryInterface = reinvestmentRepositoryInterface;
    this.reinvestmentExecutor = reinvestmentExecutor;
  }

  static getClassName = (): string => 'PushReinvestment';

  async execute(dividendId: UUID): Promise<void> {
    try {
      const reinvestmentProcessManager = await this.reinvestmentRepositoryInterface.restoreReinvestment(dividendId);

      if (!reinvestmentProcessManager) {
        return;
      }

      await this.reinvestmentExecutor.execute(reinvestmentProcessManager);
    } catch (error) {
      console.error(error);
    }
  }
}
