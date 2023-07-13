import { ContainerInterface } from 'Container/Container';
import { PortfolioController } from 'Portfolio/Port/Api/PortfolioController';

export type PortfolioApiType = {
  getAbsoluteCurrentNav: PortfolioController['getAbsoluteCurrentNav'];
  getActivePortfolio: PortfolioController['getActivePortfolio'];
  getCurrentNav: PortfolioController['getCurrentNav'];
  getCurrentSharePrice: PortfolioController['getCurrentSharePrice'];
  getDataForSubscriptionAgreement: PortfolioController['getDataForSubscriptionAgreement'];
  getPortfolio: PortfolioController['getPortfolio'];
  getPortfolioDetails: PortfolioController['getPortfolioDetails'];
  getPortfolioVendorsConfiguration: PortfolioController['getPortfolioVendorsConfiguration'];
  getProperties: PortfolioController['getProperties'];
  registerPortfolio: PortfolioController['registerPortfolio'];
  synchronizePortfolio: PortfolioController['synchronizePortfolio'];
  updateProperty: PortfolioController['updateProperty'];
};

export const PortfolioApi = (container: ContainerInterface): PortfolioApiType => ({
  synchronizePortfolio: container.delegateTo(PortfolioController, 'synchronizePortfolio'),
  getProperties: container.delegateTo(PortfolioController, 'getProperties'),
  updateProperty: container.delegateTo(PortfolioController, 'updateProperty'),
  getActivePortfolio: container.delegateTo(PortfolioController, 'getActivePortfolio'),
  getPortfolioDetails: container.delegateTo(PortfolioController, 'getPortfolioDetails'),
  getCurrentNav: container.delegateTo(PortfolioController, 'getCurrentNav'),
  getPortfolio: container.delegateTo(PortfolioController, 'getPortfolio'),
  getPortfolioVendorsConfiguration: container.delegateTo(PortfolioController, 'getPortfolioVendorsConfiguration'),
  getDataForSubscriptionAgreement: container.delegateTo(PortfolioController, 'getDataForSubscriptionAgreement'),
  getAbsoluteCurrentNav: container.delegateTo(PortfolioController, 'getAbsoluteCurrentNav'),
  getCurrentSharePrice: container.delegateTo(PortfolioController, 'getCurrentSharePrice'),
  registerPortfolio: container.delegateTo(PortfolioController, 'registerPortfolio'),
});
