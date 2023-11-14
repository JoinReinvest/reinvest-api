import { UUID } from "HKEKTypes/Generics";
import { IdGeneratorInterface } from "IdGenerator/IdGenerator";
import { Money } from "Money/Money";
import { PortfolioRepository } from "Portfolio/Adapter/Database/Repository/PortfolioRepository";
import { PortfolioNorthCapitalAdapter } from "Portfolio/Adapter/NorthCapital/PortfolioNorthCapitalAdapter";
import { UnitPrice } from "Portfolio/Domain/UnitPrice";
import { PortfolioUnitPriceRepository } from "Portfolio/Adapter/Database/Repository/PortfolioUnitPriceRepository";

export class SynchronizeUnitPrice {
  public static getClassName = (): string => 'SynchronizeUnitPrice';
  private portfolioRepository: PortfolioRepository;
  private unitPriceRepository: PortfolioUnitPriceRepository;
  private northCapitalAdapter: PortfolioNorthCapitalAdapter;
  private idGenerator: IdGeneratorInterface;

  constructor(
    unitPriceRepository: PortfolioUnitPriceRepository,
    portfolioRepository: PortfolioRepository,
    northCapitalAdapter: PortfolioNorthCapitalAdapter,
    idGenerator: IdGeneratorInterface,
  ) {
    this.portfolioRepository = portfolioRepository;
    this.unitPriceRepository = unitPriceRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.idGenerator = idGenerator;
  }

  async execute(portfolioId: UUID): Promise<boolean> {
    const portfolio = await this.portfolioRepository.getById(portfolioId);

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const offering = await this.northCapitalAdapter.getOffering(portfolio.getOfferingId());
    if (!offering) {
      throw new Error(`Offering ${portfolio.getOfferingId()} in North Capital not found`);
    }

    const latestUnitPrice = await this.unitPriceRepository.getTheLatestUnitPrice(portfolioId);

    const { unitPrice: unitPriceNumber, numberOfShares } = offering;
    const unitPriceId = this.idGenerator.createUuid();
    const unitPriceMoney = Money.lowPrecision(unitPriceNumber);

    const unitPrice = UnitPrice.create(unitPriceId, portfolioId, unitPriceMoney, numberOfShares);

    if (unitPrice.isTheSame(latestUnitPrice)) {
      return false;
    }

    await this.unitPriceRepository.store(unitPrice);

    return true;
  }
}
