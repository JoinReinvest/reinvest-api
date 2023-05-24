import { JSONObjectOf } from 'HKEKTypes/Generics';
import {
  FundsMoveState,
  NorthCapitalTradeState,
  SubscriptionAgreementState,
  TradeConfiguration,
  VendorsConfiguration,
  VertaloDistributionState,
} from 'Trading/Domain/Trade';

export interface TradesTable {
  fundsMoveStateJson: JSONObjectOf<FundsMoveState> | null;
  investmentId: string;
  northCapitalTradeStateJson: JSONObjectOf<NorthCapitalTradeState> | null;
  subscriptionAgreementStateJson: JSONObjectOf<SubscriptionAgreementState> | null;
  tradeConfigurationJson: JSONObjectOf<TradeConfiguration>;
  tradeId: string | null;
  vendorsConfigurationJson: JSONObjectOf<VendorsConfiguration> | null;
  vertaloDistributionStateJson: JSONObjectOf<VertaloDistributionState> | null;
}
