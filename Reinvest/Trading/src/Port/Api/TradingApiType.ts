import { ContainerInterface } from 'Container/Container';
import { TradingController } from 'Trading/Port/Api/TradingController';

export type TradingApiType = {
  getInvestmentIdByTradeId: TradingController['getInvestmentIdByTradeId'];
};

export const TradingApi = (container: ContainerInterface): TradingApiType => ({
  getInvestmentIdByTradeId: container.delegateTo(TradingController, 'getInvestmentIdByTradeId'),
});
