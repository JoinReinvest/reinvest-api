import { Money } from 'Money/Money';
import type { USDInput } from 'Reinvest/ApiGateway/src/Schema/Types/Investments';

import CreateInvestment from '../UseCases/CreateInvestment';
import InvestmentSummaryQuery from '../UseCases/InvestmentSummaryQuery';

export class InvestmentsController {
  private createInvestmentUseCase: CreateInvestment;
  private investmentSummaryQueryUseCase: InvestmentSummaryQuery;

  constructor(createInvestmentUseCase: CreateInvestment, investmentSummaryQueryUseCase: InvestmentSummaryQuery) {
    this.createInvestmentUseCase = createInvestmentUseCase;
    this.investmentSummaryQueryUseCase = investmentSummaryQueryUseCase;
  }

  public static getClassName = (): string => 'InvestmentsController';

  public async createInvestment(profileId: string, accountId: string, bankAccountId: string, money: USDInput) {
    const amount = new Money(money.value);

    return this.createInvestmentUseCase.execute(profileId, accountId, bankAccountId, amount);
  }

  public async investmentSummaryQuery(profileId: string, investmentId: string) {
    return await this.investmentSummaryQueryUseCase.execute(profileId, investmentId);
  }
}
