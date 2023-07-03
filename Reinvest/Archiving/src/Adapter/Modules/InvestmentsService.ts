import { Investments } from 'Investments/index';

export class InvestmentsService {
  private investmentsModule: Investments.Main;
  static getClassName = (): string => 'InvestmentsService';

  constructor(investmentsModule: Investments.Main) {
    this.investmentsModule = investmentsModule;
  }
}
