import {AbstractTransactionEvent} from "./TransactionEvent";
import {PortfolioId} from "../../Commons/PortfolioId";
import {InvestorAccountId} from "../../Commons/InvestorAccountId";
import {Money} from "../../Commons/Money";

export class TransactionCreated extends AbstractTransactionEvent {
    private readonly _portfolioId: PortfolioId;
    private readonly _investorAccountId: InvestorAccountId;
    private readonly _amountToInvest: Money;

    constructor(portfolioId: PortfolioId, investorAccountId: InvestorAccountId, amountToInvest: Money) {
        super();
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