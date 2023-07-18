import { UUID } from '../../../../shared/hkek-types/Generics';

export type PortfolioAuthorSchema = {
    id: UUID;
    avatar: { id: string };
    name: string;
};

export class PortfolioAuthor {
    private portfolioAuthorSchema: PortfolioAuthorSchema;

    constructor(portfolioAuthor: PortfolioAuthorSchema) {
        this.portfolioAuthorSchema = portfolioAuthor;
    }

    static create(schema: PortfolioAuthorSchema) {
        return new PortfolioAuthor(schema);
    }

    toObject(): PortfolioAuthorSchema {
        return this.portfolioAuthorSchema;
    }
}
