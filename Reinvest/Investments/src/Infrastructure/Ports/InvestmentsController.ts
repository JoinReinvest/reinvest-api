import { Pagination } from 'Investments/Application/Pagination';
import AbortInvestment from 'Investments/Application/UseCases/AbortInvestment';
import CreateInvestment from 'Investments/Application/UseCases/CreateInvestment';
import InvestmentSummaryQuery from 'Investments/Application/UseCases/InvestmentSummaryQuery';
import ListInvestments from 'Investments/Application/UseCases/ListInvestments';
import StartInvestment from 'Investments/Application/UseCases/StartInvestment';
import { Money } from 'Money/Money';
import type { USDInput } from 'Reinvest/ApiGateway/src/Schema/Types/Investments';

export class InvestmentsController {
  private createInvestmentUseCase: CreateInvestment;
  private investmentSummaryQueryUseCase: InvestmentSummaryQuery;
  private startInvestmentUseCase: StartInvestment;
  private abortInvestmentUseCase: AbortInvestment;
  private listInvestmentsUseCase: ListInvestments;

  constructor(
    createInvestmentUseCase: CreateInvestment,
    investmentSummaryQueryUseCase: InvestmentSummaryQuery,
    startInvestmentUseCase: StartInvestment,
    abortInvestmentUseCase: AbortInvestment,
    listInvestmentsUseCase: ListInvestments,
  ) {
    this.createInvestmentUseCase = createInvestmentUseCase;
    this.investmentSummaryQueryUseCase = investmentSummaryQueryUseCase;
    this.startInvestmentUseCase = startInvestmentUseCase;
    this.abortInvestmentUseCase = abortInvestmentUseCase;
    this.listInvestmentsUseCase = listInvestmentsUseCase;
  }

  public static getClassName = (): string => 'InvestmentsController';

  public async createInvestment(portfolioId: string, profileId: string, accountId: string, bankAccountId: string, money: USDInput, parentId: string | null) {
    const amount = new Money(money.value);

    return this.createInvestmentUseCase.execute(portfolioId, profileId, accountId, bankAccountId, amount, parentId);
  }

  public async investmentSummaryQuery(profileId: string, investmentId: string) {
    return this.investmentSummaryQueryUseCase.execute(profileId, investmentId);
  }

  public async startInvestment(profileId: string, investmentId: string, approveFees: boolean) {
    return this.startInvestmentUseCase.execute(profileId, investmentId, approveFees);
  }

  public async abortInvestment(profileId: string, investmentId: string) {
    return this.abortInvestmentUseCase.execute(profileId, investmentId);
  }

  public async listInvestments(profileId: string, accoutnId: string, pagination: Pagination) {
    return this.listInvestmentsUseCase.execute(profileId, accoutnId, pagination);
  }
}
