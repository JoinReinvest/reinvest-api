import AbortInvestment from 'Investments/Application/UseCases/AbortInvestment';
import CreateInvestment from 'Investments/Application/UseCases/CreateInvestment';
import InvestmentSummaryQuery from 'Investments/Application/UseCases/InvestmentSummaryQuery';
import StartInvestment from 'Investments/Application/UseCases/StartInvestment';
import { Money } from 'Money/Money';
import type { USDInput } from 'Reinvest/ApiGateway/src/Schema/Types/Investments';

export class InvestmentsController {
  private createInvestmentUseCase: CreateInvestment;
  private investmentSummaryQueryUseCase: InvestmentSummaryQuery;
  private startInvestmentUseCase: StartInvestment;
  private abortInvestmentUseCase: AbortInvestment;

  constructor(
    createInvestmentUseCase: CreateInvestment,
    investmentSummaryQueryUseCase: InvestmentSummaryQuery,
    startInvestmentUseCase: StartInvestment,
    abortInvestmentUseCase: AbortInvestment,
  ) {
    this.createInvestmentUseCase = createInvestmentUseCase;
    this.investmentSummaryQueryUseCase = investmentSummaryQueryUseCase;
    this.startInvestmentUseCase = startInvestmentUseCase;
    this.abortInvestmentUseCase = abortInvestmentUseCase;
  }

  public static getClassName = (): string => 'InvestmentsController';

  public async createInvestment(portfolioId: string, profileId: string, accountId: string, bankAccountId: string, money: USDInput, parentId: string | null) {
    const amount = new Money(money.value);

    return this.createInvestmentUseCase.execute(portfolioId, profileId, accountId, bankAccountId, amount, parentId);
  }

  public async investmentSummaryQuery(profileId: string, investmentId: string) {
    return await this.investmentSummaryQueryUseCase.execute(profileId, investmentId);
  }

  public async startInvestment(profileId: string, investmentId: string, approveFees: boolean) {
    return await this.startInvestmentUseCase.execute(profileId, investmentId, approveFees);
  }

  public async abortInvestment(profileId: string, investmentId: string) {
    return await this.abortInvestmentUseCase.execute(profileId, investmentId);
  }
}
