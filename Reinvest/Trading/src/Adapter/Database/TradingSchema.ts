import { JSONObject, JSONObjectOf } from 'HKEKTypes/Generics';
import { FundsMoveState, NorthCapitalTradeState, TradeConfiguration, VendorsConfiguration, VertaloDistributionState } from 'Trading/Domain/Trade';

export interface TradesTable {
  fundsMoveStateJson: JSONObjectOf<FundsMoveState> | null;
  investmentId: string;
  northCapitalTradeStateJson: JSONObjectOf<NorthCapitalTradeState> | null;
  subscriptionAgreementStateJson: JSONObject | null;
  tradeConfigurationJson: JSONObjectOf<TradeConfiguration>;
  vendorsConfigurationJson: JSONObjectOf<VendorsConfiguration> | null;
  vertaloDistributionStateJson: JSONObjectOf<VertaloDistributionState> | null;
}
