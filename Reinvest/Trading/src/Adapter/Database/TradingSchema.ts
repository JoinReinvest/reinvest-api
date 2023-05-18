import { JSONObject, JSONObjectOf } from 'HKEKTypes/Generics';
import { TradeConfiguration, VendorIdsConfiguration } from 'Trading/Domain/Trade';

export interface TradesTable {
  fundsMoveStateJson: JSONObject | null;
  investmentId: string;
  northCapitalTradeStateJson: JSONObject | null;
  subscriptionAgreementStateJson: JSONObject | null;
  tradeConfigurationJson: JSONObjectOf<TradeConfiguration>;
  vendorIdsJson: JSONObjectOf<VendorIdsConfiguration> | null;
  vertaloDistributionStateJson: JSONObject | null;
}
