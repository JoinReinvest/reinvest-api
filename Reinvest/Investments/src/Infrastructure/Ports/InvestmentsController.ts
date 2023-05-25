import { Money } from 'Money/Money';
import type { USDInput } from 'Reinvest/ApiGateway/src/Schema/Types/Investments';

import AssignSubscriptionAgreementToInvestment from '../UseCases/AssignSubscriptionAgreementToInvestment';
import CreateInvestment from '../UseCases/CreateInvestment';
import InvestmentSummaryQuery from '../UseCases/InvestmentSummaryQuery';

export class InvestmentsController {
  private createInvestmentUseCase: CreateInvestment;
  private investmentSummaryQueryUseCase: InvestmentSummaryQuery;
  private assignSubscriptionAgreementToInvestmentUseCase: AssignSubscriptionAgreementToInvestment;

  constructor(
    createInvestmentUseCase: CreateInvestment,
    investmentSummaryQueryUseCase: InvestmentSummaryQuery,
    assignSubscriptionAgreementToInvestmentUseCase: AssignSubscriptionAgreementToInvestment,
  ) {
    this.createInvestmentUseCase = createInvestmentUseCase;
    this.investmentSummaryQueryUseCase = investmentSummaryQueryUseCase;
    this.assignSubscriptionAgreementToInvestmentUseCase = assignSubscriptionAgreementToInvestmentUseCase;
  }

  public static getClassName = (): string => 'InvestmentsController';

  public async createInvestment(profileId: string, accountId: string, bankAccountId: string, money: USDInput) {
    const amount = new Money(money.value);

    return this.createInvestmentUseCase.execute(profileId, accountId, bankAccountId, amount);
  }

  public async investmentSummaryQuery(profileId: string, investmentId: string) {
    return await this.investmentSummaryQueryUseCase.execute(profileId, investmentId);
  }

  public async assignSubscriptionAgreementToInvestment(investmentId: string, subscriptionAgreementId: string) {
    return await this.assignSubscriptionAgreementToInvestmentUseCase.execute(investmentId, subscriptionAgreementId);
  }
}
