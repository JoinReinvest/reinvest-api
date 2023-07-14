import { ContainerInterface } from 'Container/Container';
import { PortfolioController } from 'Portfolio/Port/Api/PortfolioController';
import { PortfolioUpdatesController } from 'Portfolio/Port/Api/PortfolioUpdatesController';

export type PortfolioApiType = {
  getAbsoluteCurrentNav: PortfolioController['getAbsoluteCurrentNav'];
  getActivePortfolio: PortfolioController['getActivePortfolio'];
  getCurrentNav: PortfolioController['getCurrentNav'];
  getDataForSubscriptionAgreement: PortfolioController['getDataForSubscriptionAgreement'];
  getPortfolio: PortfolioController['getPortfolio'];
  getPortfolioDetails: PortfolioController['getPortfolioDetails'];
  getPortfolioVendorsConfiguration: PortfolioController['getPortfolioVendorsConfiguration'];
  getProperties: PortfolioController['getProperties'];
  synchronizePortfolio: PortfolioController['synchronizePortfolio'];
  updateProperty: PortfolioController['updateProperty'];
  addPortfolioUpdate: PortfolioUpdatesController['add'];
  deletePortfolioUpdate: PortfolioUpdatesController['delete'];
  getAllPortfolioUpdates: PortfolioUpdatesController['getAll'];
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
  addPortfolioUpdate: container.delegateTo(PortfolioUpdatesController, 'add'),
  deletePortfolioUpdate: container.delegateTo(PortfolioUpdatesController, 'delete'),
  getAllPortfolioUpdates: container.delegateTo(PortfolioUpdatesController, 'getAll'),
});
