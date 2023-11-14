import { ContainerInterface } from "Container/Container";
import { PortfolioAuthorsController } from "Portfolio/Port/Api/PortfolioAuthorsController";
import { PortfolioController } from "Portfolio/Port/Api/PortfolioController";
import { PortfolioUpdatesController } from "Portfolio/Port/Api/PortfolioUpdatesController";

export type PortfolioApiType = {
  addPortfolioAuthor: PortfolioAuthorsController['add'];
  addPortfolioUpdate: PortfolioUpdatesController['add'];
  deletePortfolioAuthor: PortfolioAuthorsController['delete'];
  deletePortfolioUpdate: PortfolioUpdatesController['delete'];
  getActivePortfolio: PortfolioController['getActivePortfolio'];
  getAllPortfolioAuthors: PortfolioUpdatesController['getAll'];
  getAllPortfolioUpdates: PortfolioUpdatesController['getAll'];
  getCurrentNav: PortfolioController['getCurrentNav'];
  getCurrentUnitPrice: PortfolioController['getCurrentUnitPrice'];
  getPortfolioAssetDetails: PortfolioController['getPortfolioAssetDetails'];
  getPortfolioDetails: PortfolioController['getPortfolioDetails'];
  getPortfolioVendorsConfiguration: PortfolioController['getPortfolioVendorsConfiguration'];
  registerPortfolio: PortfolioController['registerPortfolio'];
  synchronizePortfolioUnitPrice: PortfolioController['synchronizePortfolioUnitPrice'];
  setPortfolioNav: PortfolioController['setPortfolioNav'];
  synchronizePortfolio: PortfolioController['synchronizePortfolio'];
  updateProperty: PortfolioController['updateProperty'];
};

export const PortfolioApi = (container: ContainerInterface): PortfolioApiType => ({
  synchronizePortfolio: container.delegateTo(PortfolioController, 'synchronizePortfolio'),
  updateProperty: container.delegateTo(PortfolioController, 'updateProperty'),
  getActivePortfolio: container.delegateTo(PortfolioController, 'getActivePortfolio'),
  getPortfolioDetails: container.delegateTo(PortfolioController, 'getPortfolioDetails'),
  getCurrentNav: container.delegateTo(PortfolioController, 'getCurrentNav'),
  getCurrentUnitPrice: container.delegateTo(PortfolioController, 'getCurrentUnitPrice'),
  getPortfolioVendorsConfiguration: container.delegateTo(PortfolioController, 'getPortfolioVendorsConfiguration'),
  getPortfolioAssetDetails: container.delegateTo(PortfolioController, 'getPortfolioAssetDetails'),
  registerPortfolio: container.delegateTo(PortfolioController, 'registerPortfolio'),
  setPortfolioNav: container.delegateTo(PortfolioController, 'setPortfolioNav'),
  synchronizePortfolioUnitPrice: container.delegateTo(PortfolioController, 'synchronizePortfolioUnitPrice'),
  addPortfolioUpdate: container.delegateTo(PortfolioUpdatesController, 'add'),
  addPortfolioAuthor: container.delegateTo(PortfolioAuthorsController, 'add'),
  deletePortfolioUpdate: container.delegateTo(PortfolioUpdatesController, 'delete'),
  deletePortfolioAuthor: container.delegateTo(PortfolioAuthorsController, 'delete'),
  getAllPortfolioUpdates: container.delegateTo(PortfolioUpdatesController, 'getAll'),
  getAllPortfolioAuthors: container.delegateTo(PortfolioAuthorsController, 'getAll'),
});
