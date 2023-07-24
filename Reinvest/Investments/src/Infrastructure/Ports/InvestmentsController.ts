import { Pagination, UUID } from 'HKEKTypes/Generics';
import AbortInvestment from 'Investments/Application/UseCases/AbortInvestment';
import { CancelInvestment } from 'Investments/Application/UseCases/CancelInvestment';
import { CreateInvestment } from 'Investments/Application/UseCases/CreateInvestment';
import InvestmentSummaryQuery from 'Investments/Application/UseCases/InvestmentSummaryQuery';
import ListInvestmentsQuery, { InvestmentOverview } from 'Investments/Application/UseCases/ListInvestmentsQuery';
import StartInvestment from 'Investments/Application/UseCases/StartInvestment';
import { TransferInvestments } from 'Investments/Application/UseCases/TransferInvestments';
import { Money } from 'Money/Money';
import type { USDInput } from 'Reinvest/ApiGateway/src/Schema/Types/Investments';

export class InvestmentsController {
  private createInvestmentUseCase: CreateInvestment;
  private investmentSummaryQueryUseCase: InvestmentSummaryQuery;
  private startInvestmentUseCase: StartInvestment;
  private abortInvestmentUseCase: AbortInvestment;
  private listInvestmentsQuery: ListInvestmentsQuery;
  private cancelInvestmentUseCase: CancelInvestment;
  private transferInvestmentsUseCase: TransferInvestments;

  constructor(
    createInvestmentUseCase: CreateInvestment,
    investmentSummaryQueryUseCase: InvestmentSummaryQuery,
    startInvestmentUseCase: StartInvestment,
    abortInvestmentUseCase: AbortInvestment,
    listInvestmentsQuery: ListInvestmentsQuery,
    cancelInvestmentUseCase: CancelInvestment,
    transferInvestmentsUseCase: TransferInvestments,
  ) {
    this.createInvestmentUseCase = createInvestmentUseCase;
    this.investmentSummaryQueryUseCase = investmentSummaryQueryUseCase;
    this.startInvestmentUseCase = startInvestmentUseCase;
    this.abortInvestmentUseCase = abortInvestmentUseCase;
    this.listInvestmentsQuery = listInvestmentsQuery;
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

  public async listInvestments(profileId: UUID, accountId: UUID, pagination: Pagination): Promise<InvestmentOverview[]> {
    return this.listInvestmentsQuery.listAllInvestments(profileId, accountId, pagination);
  }

  public async cancelInvestment(profileId: UUID, investmentId: UUID) {
    return this.cancelInvestmentUseCase.execute(profileId, investmentId);
  }

  public async transferInvestments(profileId: UUID, transferFromAccount: UUID, transferToAccount: UUID) {
    return this.transferInvestmentsUseCase.execute(profileId, transferFromAccount, transferToAccount);
  }

  public async getPendingInvestments(pagination: Pagination): Promise<UUID[]> {
    return this.listInvestmentsQuery.getPendingInvestmentsIds(pagination);
  }
}
