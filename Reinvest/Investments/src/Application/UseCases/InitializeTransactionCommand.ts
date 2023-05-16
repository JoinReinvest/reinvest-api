import { InvestorAccountId } from '../../Commons/InvestorAccountId';
import { Money } from '../../Commons/Money';
import { PortfolioId } from '../../Commons/PortfolioId';

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
