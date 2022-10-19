import {TransactionCommand} from "./TransactionCommand";
import {PortfolioId} from "../../../Commons/PortfolioId";
import {InvestorAccountId} from "../../../Commons/InvestorAccountId";
import {Money} from "../../../Commons/Money";
import {TransactionId} from "../ValueObject/TransactionId";

export class CreateTrade implements TransactionCommand {
    transactionCommandGuard: boolean = true;

    private readonly _transactionId: TransactionId;
    private readonly _portfolioId: PortfolioId;
    private readonly _investorAccountId: InvestorAccountId;
    private readonly _amountToInvest: Money;

    constructor(transactionId: TransactionId, portfolioId: PortfolioId, investorAccountId: InvestorAccountId, amountToInvest: Money) {
        this._transactionId = transactionId;
        this._portfolioId = portfolioId;
        this._investorAccountId = investorAccountId;
        this._amountToInvest = amountToInvest;
    }

    static create(transactionId: TransactionId, portfolioId: PortfolioId, investorAccountId: InvestorAccountId, amountToInvest: Money): CreateTrade {
        return new CreateTrade(
            transactionId,
            portfolioId,
            investorAccountId,
            amountToInvest
        );
    }

    get transactionId(): TransactionId {
        return this._transactionId;
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