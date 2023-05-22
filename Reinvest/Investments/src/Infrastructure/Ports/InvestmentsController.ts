import { Money } from 'Money/Money';
import type { USDInput } from 'Reinvest/ApiGateway/src/Schema/Types/Investments';

import CreateInvestment from '../UseCases/CreateInvestment';

export class InvestmentsController {
  private createInvestmentUseCase: CreateInvestment;

  constructor(createInvestmentUseCase: CreateInvestment) {
    this.createInvestmentUseCase = createInvestmentUseCase;
  }

  public static getClassName = (): string => 'InvestmentsController';

  public async createInvestment(profileId: string, accountId: string, bankAccountId: string, money: USDInput) {
    const amount = new Money(money.value);

    return this.createInvestmentUseCase.execute(profileId, accountId, bankAccountId, amount);
  }
}
