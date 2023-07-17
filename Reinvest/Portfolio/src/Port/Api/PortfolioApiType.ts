import { ContainerInterface } from 'Container/Container';
import { PortfolioController } from 'Portfolio/Port/Api/PortfolioController';
import { PortfolioUpdatesController } from 'Portfolio/Port/Api/PortfolioUpdatesController';

export type PortfolioApiType = {
  addPortfolioUpdate: PortfolioUpdatesController['add'];
  deletePortfolioUpdate: PortfolioUpdatesController['delete'];
  getActivePortfolio: PortfolioController['getActivePortfolio'];
  getAllPortfolioUpdates: PortfolioUpdatesController['getAll'];
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
  addPortfolioUpdate: container.delegateTo(PortfolioUpdatesController, 'add'),
  deletePortfolioUpdate: container.delegateTo(PortfolioUpdatesController, 'delete'),
  getAllPortfolioUpdates: container.delegateTo(PortfolioUpdatesController, 'getAll'),
});
