import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { Money } from 'Money/Money';
import { PortfolioNavRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioNavRepository';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { PortfolioNorthCapitalAdapter } from 'Portfolio/Adapter/NorthCapital/PortfolioNorthCapitalAdapter';
import { Nav } from 'Portfolio/Domain/Nav';
import { DomainEvent } from 'SimpleAggregator/Types';

export class SynchronizeNav {
  public static getClassName = (): string => 'SynchronizeNav';
  private portfolioRepository: PortfolioRepository;
  private navRepository: PortfolioNavRepository;
  private northCapitalAdapter: PortfolioNorthCapitalAdapter;
  private idGenerator: IdGeneratorInterface;

  constructor(
    navRepository: PortfolioNavRepository,
    portfolioRepository: PortfolioRepository,
    northCapitalAdapter: PortfolioNorthCapitalAdapter,
    idGenerator: IdGeneratorInterface,
  ) {
    this.portfolioRepository = portfolioRepository;
    this.navRepository = navRepository;
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

    const latestNav = await this.navRepository.getTheLatestNav(portfolioId);

    const { unitPrice: unitPriceNumber, numberOfShares } = offering;
    const navId = this.idGenerator.createUuid();
    const unitPrice = Money.lowPrecision(unitPriceNumber);

    const nav = Nav.create(navId, portfolioId, unitPrice, numberOfShares);

    if (nav.isTheSame(latestNav)) {
      return false;
    }

    await this.navRepository.store(nav, [
      <DomainEvent>{
        kind: 'NAV_UPDATED',
        id: navId,
        data: {
          unitPrice: unitPriceNumber,
          numberOfShares,
          portfolioId,
        },
      },
    ]);

    return true;
  }
}
