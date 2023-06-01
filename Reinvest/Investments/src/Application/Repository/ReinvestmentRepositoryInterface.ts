import { ReinvestmentProcessManager } from 'Investments/Application/ReinvestmentProcessManager/ReinvestmentProcessManager';
import { ReinvestmentEvent } from 'Investments/Domain/Reinvestments/ReinvestmentEvents';

export interface ReinvestmentRepositoryInterface {
  restoreReinvestment(dividendId: string): Promise<ReinvestmentProcessManager>;

  saveEvent(event: ReinvestmentEvent): Promise<void>;
}
