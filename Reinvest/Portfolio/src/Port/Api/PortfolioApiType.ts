import { ContainerInterface } from 'Container/Container';
import { PortfolioController } from 'Portfolio/Port/Api/PortfolioController';

export type PortfolioApiType = {
  getActivePortfolio: PortfolioController['getActivePortfolio'];
  getCurrentNav: PortfolioController['getCurrentNav'];
  getPortfolio: PortfolioController['getPortfolio'];
  getPortfolioDetails: PortfolioController['getPortfolioDetails'];
  getPortfolioVendorsConfiguration: PortfolioController['getPortfolioVendorsConfiguration'];
  getProperty: PortfolioController['getProperty'];
  synchronizePortfolio: PortfolioController['synchronizePortfolio'];
  updateProperty: PortfolioController['updateProperty'];
};

export const PortfolioApi = (container: ContainerInterface): PortfolioApiType => ({
  synchronizePortfolio: container.delegateTo(PortfolioController, 'synchronizePortfolio'),
  getProperty: container.delegateTo(PortfolioController, 'getProperty'),
  updateProperty: container.delegateTo(PortfolioController, 'updateProperty'),
  getActivePortfolio: container.delegateTo(PortfolioController, 'getActivePortfolio'),
  getPortfolioDetails: container.delegateTo(PortfolioController, 'getPortfolioDetails'),
  getCurrentNav: container.delegateTo(PortfolioController, 'getCurrentNav'),
  getPortfolio: container.delegateTo(PortfolioController, 'getPortfolio'),
  getPortfolioVendorsConfiguration: container.delegateTo(PortfolioController, 'getPortfolioVendorsConfiguration'),
});
