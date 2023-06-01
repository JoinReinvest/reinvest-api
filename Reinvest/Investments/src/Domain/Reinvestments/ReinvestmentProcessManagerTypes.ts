import { ReinvestmentDecision } from 'Investments/Domain/Reinvestments/ReinvestmentDecisions';
import { ReinvestmentEvent } from 'Investments/Domain/Reinvestments/ReinvestmentEvents';

export interface ReinvestmentProcessManagerTypes {
  handleEvent(event: ReinvestmentEvent): void;

  makeDecision(): ReinvestmentDecision;
}
