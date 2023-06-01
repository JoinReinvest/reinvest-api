import AssignSubscriptionAgreementToInvestment from 'Investments/Application/UseCases/AssignSubscriptionAgreementToInvestment';
import CreateInvestment from 'Investments/Application/UseCases/CreateInvestment';
import InvestmentSummaryQuery from 'Investments/Application/UseCases/InvestmentSummaryQuery';
import StartInvestment from 'Investments/Application/UseCases/StartInvestment';
import { Money } from 'Money/Money';
import type { USDInput } from 'Reinvest/ApiGateway/src/Schema/Types/Investments';

export class InvestmentsController {
  private createInvestmentUseCase: CreateInvestment;
  private investmentSummaryQueryUseCase: InvestmentSummaryQuery;
  private assignSubscriptionAgreementToInvestmentUseCase: AssignSubscriptionAgreementToInvestment;
  private startInvestmentUseCase: StartInvestment;

  constructor(
    createInvestmentUseCase: CreateInvestment,
    investmentSummaryQueryUseCase: InvestmentSummaryQuery,
    assignSubscriptionAgreementToInvestmentUseCase: AssignSubscriptionAgreementToInvestment,
    startInvestmentUseCase: StartInvestment,
  ) {
    this.createInvestmentUseCase = createInvestmentUseCase;
    this.investmentSummaryQueryUseCase = investmentSummaryQueryUseCase;
    this.assignSubscriptionAgreementToInvestmentUseCase = assignSubscriptionAgreementToInvestmentUseCase;
    this.startInvestmentUseCase = startInvestmentUseCase;
  }

  public static getClassName = (): string => 'InvestmentsController';

  public async createInvestment(portfolioId: string, profileId: string, accountId: string, bankAccountId: string, money: USDInput, parentId: string | null) {
    const amount = new Money(money.value);

    return this.createInvestmentUseCase.execute(portfolioId, profileId, accountId, bankAccountId, amount, parentId);
  }

  public async investmentSummaryQuery(profileId: string, investmentId: string) {
    return await this.investmentSummaryQueryUseCase.execute(profileId, investmentId);
  }

  public async assignSubscriptionAgreementToInvestment(investmentId: string, subscriptionAgreementId: string) {
    return await this.assignSubscriptionAgreementToInvestmentUseCase.execute(investmentId, subscriptionAgreementId);
  }

  public async startInvestment(profileId: string, investmentId: string) {
    return await this.startInvestmentUseCase.execute(profileId, investmentId);
  }
}
