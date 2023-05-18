import { ContainerInterface } from 'Container/Container';
import { CreateTradeHandler } from 'Trading/Port/Queue/EventHandler/CreateTradeHandler';

export type TradingTechnicalHandlerType = {
  CreateTrade: CreateTradeHandler['handle'];
};

export const TradingTechnicalHandler = (container: ContainerInterface): TradingTechnicalHandlerType => ({
  CreateTrade: container.delegateTo(CreateTradeHandler, 'handle'),
});
