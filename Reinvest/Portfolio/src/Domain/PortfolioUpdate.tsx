import {UUID} from "../../../../shared/hkek-types/Generics";

export type PortfolioUpdateSchema = {
    portfolioId: UUID;
};

export class PortfolioUpdate {
    private portfolioId: UUID;

    constructor(portfolioId: UUID) {
        this.portfolioId = portfolioId;
    }

    static create({portfolioId}: PortfolioUpdateSchema) {
        return new PortfolioUpdate(portfolioId);
    }
}