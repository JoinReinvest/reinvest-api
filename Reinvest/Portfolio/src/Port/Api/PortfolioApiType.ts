import { ContainerInterface } from 'Container/Container';
import { PortfolioController } from 'Portfolio/Port/Api/PortfolioController';

export type PortfolioApiType = {
  getActivePortfolio: PortfolioController['getActivePortfolio'];
  getCurrentNav: PortfolioController['getCurrentNav'];
  getPortfolio: PortfolioController['getPortfolio'];
  getPortfolioVendorsConfiguration: PortfolioController['getPortfolioVendorsConfiguration'];
};

export const PortfolioApi = (container: ContainerInterface): PortfolioApiType => ({
  getActivePortfolio: container.delegateTo(PortfolioController, 'getActivePortfolio'),
  getCurrentNav: container.delegateTo(PortfolioController, 'getCurrentNav'),
  getPortfolio: container.delegateTo(PortfolioController, 'getPortfolio'),
  getPortfolioVendorsConfiguration: container.delegateTo(PortfolioController, 'getPortfolioVendorsConfiguration'),
});
