import { ContainerInterface } from 'Container/Container';
import { PortfolioController } from 'Portfolio/Port/Api/PortfolioController';

export type PortfolioApiType = {
  getActivePortfolio: PortfolioController['getActivePortfolio'];
  getCurrentNav: PortfolioController['getCurrentNav'];
  getDataForSubscriptionAgreement: PortfolioController['getDataForSubscriptionAgreement'];
  getPortfolioDetails: PortfolioController['getPortfolioDetails'];
  getPortfolioVendorsConfiguration: PortfolioController['getPortfolioVendorsConfiguration'];
  registerPortfolio: PortfolioController['registerPortfolio'];
  synchronizeNav: PortfolioController['synchronizeNav'];
  synchronizePortfolio: PortfolioController['synchronizePortfolio'];
  updateProperty: PortfolioController['updateProperty'];
};

export const PortfolioApi = (container: ContainerInterface): PortfolioApiType => ({
  synchronizePortfolio: container.delegateTo(PortfolioController, 'synchronizePortfolio'),
  updateProperty: container.delegateTo(PortfolioController, 'updateProperty'),
  getActivePortfolio: container.delegateTo(PortfolioController, 'getActivePortfolio'),
  getPortfolioDetails: container.delegateTo(PortfolioController, 'getPortfolioDetails'),
  getCurrentNav: container.delegateTo(PortfolioController, 'getCurrentNav'),
  getPortfolioVendorsConfiguration: container.delegateTo(PortfolioController, 'getPortfolioVendorsConfiguration'),
  getDataForSubscriptionAgreement: container.delegateTo(PortfolioController, 'getDataForSubscriptionAgreement'),
  registerPortfolio: container.delegateTo(PortfolioController, 'registerPortfolio'),
  synchronizeNav: container.delegateTo(PortfolioController, 'synchronizeNav'),
});
