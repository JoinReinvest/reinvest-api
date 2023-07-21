import { ContainerInterface } from 'Container/Container';
import { PortfolioAuthorsController } from 'Portfolio/Port/Api/PortfolioAuthorsController';
import { PortfolioController } from 'Portfolio/Port/Api/PortfolioController';
import { PortfolioUpdatesController } from 'Portfolio/Port/Api/PortfolioUpdatesController';

export type PortfolioApiType = {
  addPortfolioAuthor: PortfolioAuthorsController['add'];
  addPortfolioUpdate: PortfolioUpdatesController['add'];
  deletePortfolioAuthor: PortfolioAuthorsController['delete'];
  deletePortfolioUpdate: PortfolioUpdatesController['delete'];
  getActivePortfolio: PortfolioController['getActivePortfolio'];
  getAllPortfolioAuthors: PortfolioUpdatesController['getAll'];
  getAllPortfolioUpdates: PortfolioUpdatesController['getAll'];
  getCurrentNav: PortfolioController['getCurrentNav'];
  getPortfolioAssetDetails: PortfolioController['getPortfolioAssetDetails'];
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
  getPortfolioAssetDetails: container.delegateTo(PortfolioController, 'getPortfolioAssetDetails'),
  registerPortfolio: container.delegateTo(PortfolioController, 'registerPortfolio'),
  synchronizeNav: container.delegateTo(PortfolioController, 'synchronizeNav'),
  addPortfolioUpdate: container.delegateTo(PortfolioUpdatesController, 'add'),
  addPortfolioAuthor: container.delegateTo(PortfolioAuthorsController, 'add'),
  deletePortfolioUpdate: container.delegateTo(PortfolioUpdatesController, 'delete'),
  deletePortfolioAuthor: container.delegateTo(PortfolioAuthorsController, 'delete'),
  getAllPortfolioUpdates: container.delegateTo(PortfolioUpdatesController, 'getAll'),
  getAllPortfolioAuthors: container.delegateTo(PortfolioAuthorsController, 'getAll'),
});
