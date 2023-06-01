import { InvestorAccountId } from 'Investments/Domain/TransactionModeled/Commons/InvestorAccountId';
import { PortfolioId } from 'Investments/Domain/TransactionModeled/Commons/PortfolioId';
import { Money } from 'Money/Money';

export class InitializeTransactionCommand {
  private readonly _portfolioId: PortfolioId;
  private readonly _investorAccountId: InvestorAccountId;
  private readonly _amountToInvest: Money;

  constructor(portfolioId: PortfolioId, investorAccountId: InvestorAccountId, amountToInvest: Money) {
    this._portfolioId = portfolioId;
    this._investorAccountId = investorAccountId;
    this._amountToInvest = amountToInvest;
  }

  get portfolioId(): PortfolioId {
    return this._portfolioId;
  }

  get investorAccountId(): InvestorAccountId {
    return this._investorAccountId;
  }

  get amountToInvest(): Money {
    return this._amountToInvest;
  }
}
