import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { Money } from 'Money/Money';
import { PortfolioNavRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioNavRepository';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { PortfolioNorthCapitalAdapter } from 'Portfolio/Adapter/NorthCapital/PortfolioNorthCapitalAdapter';
import { PortfolioVertaloAdapter } from 'Portfolio/Adapter/Vertalo/PortfolioVertaloAdapter';
import { Nav } from 'Portfolio/Domain/Nav';
import { Portfolio } from 'Portfolio/Domain/Portfolio';
import { DomainEvent } from 'SimpleAggregator/Types';
import { UnitPrice } from 'Portfolio/Domain/UnitPrice';
import { PortfolioUnitPriceRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioUnitPriceRepository';

export class RegisterPortfolio {
  public static getClassName = (): string => 'RegisterPortfolio';
  private unitPriceRepository: PortfolioUnitPriceRepository;
  private navRepository: PortfolioNavRepository;
  private portfolioRepository: PortfolioRepository;
  private vertaloAdapter: PortfolioVertaloAdapter;
  private northCapitalAdapter: PortfolioNorthCapitalAdapter;
  private idGenerator: IdGeneratorInterface;

  constructor(
    portfolioRepository: PortfolioRepository,
    navRepository: PortfolioNavRepository,
    unitPriceRepository: PortfolioUnitPriceRepository,
    northCapitalAdapter: PortfolioNorthCapitalAdapter,
    vertaloAdapter: PortfolioVertaloAdapter,
    idGenerator: IdGeneratorInterface,
  ) {
    this.unitPriceRepository = unitPriceRepository;
    this.navRepository = navRepository;
    this.portfolioRepository = portfolioRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.vertaloAdapter = vertaloAdapter;
    this.idGenerator = idGenerator;
  }

  async execute(
    name: string,
    northCapitalOfferingId: string,
    vertaloAllocationId: string,
    linkToOfferingCircular: string,
    initUnitNav: number,
    initNumberOfSharesForNav: number,
  ): Promise<UUID | never> {
    const activePortfolio = await this.portfolioRepository.getActivePortfolio();

    if (activePortfolio) {
      throw new Error('Active portfolio already exists');
    }

    // hard-coded for now to match the data on all environments
    const portfolioId = '34ccfe14-dc18-40df-a1d6-04f33b9fa7f4';

    const assetName = await this.vertaloAdapter.getAssetName(vertaloAllocationId);

    if (!assetName) {
      throw new Error(`Asset for allocation ${vertaloAllocationId} in Vertalo not found`);
    }

    const offering = await this.northCapitalAdapter.getOffering(northCapitalOfferingId);

    if (!offering) {
      throw new Error(`Offering ${northCapitalOfferingId} in North Capital not found`);
    }

    const { offeringName, unitPrice: unitPriceInOffering, numberOfShares: numberOfSharesInOffering } = offering;
    const unitPriceId = this.idGenerator.createUuid();
    const navId = this.idGenerator.createUuid();
    const unitPrice = Money.lowPrecision(unitPriceInOffering);
    const unitNav = Money.lowPrecision(initUnitNav);

    const portfolio = Portfolio.create(portfolioId, name, northCapitalOfferingId, offeringName, vertaloAllocationId, assetName, linkToOfferingCircular);
    const initUnitPrice = UnitPrice.create(unitPriceId, portfolioId, unitPrice, numberOfSharesInOffering);
    const initNav = Nav.create(navId, portfolioId, unitNav, initNumberOfSharesForNav);

    await this.portfolioRepository.store(portfolio);
    await this.unitPriceRepository.store(initUnitPrice);
    await this.navRepository.store(initNav, [
      <DomainEvent>{
        kind: 'NAV_UPDATED',
        id: navId,
        data: {
          portfolioId,
          unitNav: unitNav.getAmount(),
          numberOfShares: initNumberOfSharesForNav,
        },
      },
    ]);

    return portfolioId;
  }
}
