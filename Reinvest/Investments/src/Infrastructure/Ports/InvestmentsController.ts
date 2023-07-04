import { UUID } from 'HKEKTypes/Generics';
import { Pagination } from 'Investments/Application/Pagination';
import AbortInvestment from 'Investments/Application/UseCases/AbortInvestment';
import { CancelInvestment } from 'Investments/Application/UseCases/CancelInvestment';
import CreateInvestment from 'Investments/Application/UseCases/CreateInvestment';
import InvestmentSummaryQuery from 'Investments/Application/UseCases/InvestmentSummaryQuery';
import ListInvestments from 'Investments/Application/UseCases/ListInvestments';
import StartInvestment from 'Investments/Application/UseCases/StartInvestment';
import { TransferInvestments } from 'Investments/Application/UseCases/TransferInvestments';
import { Money } from 'Money/Money';
import type { USDInput } from 'Reinvest/ApiGateway/src/Schema/Types/Investments';

export class InvestmentsController {
  private createInvestmentUseCase: CreateInvestment;
  private investmentSummaryQueryUseCase: InvestmentSummaryQuery;
  private startInvestmentUseCase: StartInvestment;
  private abortInvestmentUseCase: AbortInvestment;
  private listInvestmentsUseCase: ListInvestments;
  private cancelInvestmentUseCase: CancelInvestment;
  private transferInvestmentsUseCase: TransferInvestments;

  constructor(
    createInvestmentUseCase: CreateInvestment,
    investmentSummaryQueryUseCase: InvestmentSummaryQuery,
    startInvestmentUseCase: StartInvestment,
    abortInvestmentUseCase: AbortInvestment,
    listInvestmentsUseCase: ListInvestments,
    cancelInvestmentUseCase: CancelInvestment,
    transferInvestmentsUseCase: TransferInvestments,
  ) {
    this.createInvestmentUseCase = createInvestmentUseCase;
    this.investmentSummaryQueryUseCase = investmentSummaryQueryUseCase;
    this.startInvestmentUseCase = startInvestmentUseCase;
    this.abortInvestmentUseCase = abortInvestmentUseCase;
    this.listInvestmentsUseCase = listInvestmentsUseCase;
    this.cancelInvestmentUseCase = cancelInvestmentUseCase;
    this.transferInvestmentsUseCase = transferInvestmentsUseCase;
  }

  public static getClassName = (): string => 'InvestmentsController';

  public async createInvestment(portfolioId: UUID, profileId: UUID, accountId: UUID, bankAccountId: UUID, money: USDInput, parentId: UUID | null) {
    const amount = new Money(money.value);

    return this.createInvestmentUseCase.execute(portfolioId, profileId, accountId, bankAccountId, amount, parentId);
  }

  public async investmentSummaryQuery(profileId: UUID, investmentId: UUID) {
    return this.investmentSummaryQueryUseCase.execute(profileId, investmentId);
  }

  public async startInvestment(profileId: UUID, investmentId: UUID, approveFees: boolean, clientIp: string) {
    return this.startInvestmentUseCase.execute(profileId, investmentId, approveFees, clientIp);
  }

  public async abortInvestment(profileId: UUID, investmentId: UUID) {
    return this.abortInvestmentUseCase.execute(profileId, investmentId);
  }

  public async listInvestments(profileId: UUID, accountId: UUID, pagination: Pagination) {
    return this.listInvestmentsUseCase.execute(profileId, accountId, pagination);
  }

  public async cancelInvestment(profileId: UUID, investmentId: UUID) {
    return this.cancelInvestmentUseCase.execute(profileId, investmentId);
  }

  public async transferInvestments(profileId: UUID, transferFromAccount: UUID, transferToAccount: UUID) {
    return this.transferInvestmentsUseCase.execute(profileId, transferFromAccount, transferToAccount);
  }
}
