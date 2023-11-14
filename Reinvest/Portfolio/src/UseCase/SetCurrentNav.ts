import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { Money } from 'Money/Money';
import { PortfolioNavRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioNavRepository';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { Nav } from 'Portfolio/Domain/Nav';
import { DomainEvent } from 'SimpleAggregator/Types';

export class SetCurrentNav {
  public static getClassName = (): string => 'SetCurrentNav';
  private portfolioRepository: PortfolioRepository;
  private navRepository: PortfolioNavRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(navRepository: PortfolioNavRepository, portfolioRepository: PortfolioRepository, idGenerator: IdGeneratorInterface) {
    this.portfolioRepository = portfolioRepository;
    this.navRepository = navRepository;
    this.idGenerator = idGenerator;
  }

  async execute(portfolioId: UUID, unitNav: Money, numberOfSharesForNav: number): Promise<boolean> {
    const portfolio = await this.portfolioRepository.getById(portfolioId);

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const latestNav = await this.navRepository.getTheLatestNav(portfolioId);

    const navId = this.idGenerator.createUuid();
    const nav = Nav.create(navId, portfolioId, unitNav, numberOfSharesForNav);

    if (nav.isTheSame(latestNav)) {
      return false;
    }

    await this.navRepository.store(nav, [
      <DomainEvent>{
        kind: 'NAV_UPDATED',
        id: navId,
        data: {
          unitNav: unitNav.getAmount(),
          numberOfShares: numberOfSharesForNav,
          portfolioId,
        },
      },
    ]);

    return true;
  }
}
