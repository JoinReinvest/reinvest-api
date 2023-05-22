import { Money } from 'Money/Money';
import { ExecutionNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/ExecutionNorthCapitalAdapter';
import { FundsMoveState, NorthCapitalTradeState } from 'Trading/Domain/Trade';

export type NorthCapitalConfig = {
  API_URL: string;
  CLIENT_ID: string;
  DEVELOPER_API_KEY: string;
};

export class TradingNorthCapitalAdapter extends ExecutionNorthCapitalAdapter {
  static getClassName = () => 'TradingNorthCapitalAdapter';

  async createTrade(offeringId: string, northCapitalAccountId: string, numberOfShares: string, ip: string): Promise<NorthCapitalTradeState> {
    const endpoint = 'tapiv3/index.php/v3/createTrade';
    const data = {
      offeringId,
      accountId: northCapitalAccountId,
      transactionType: 'ACH',
      transactionUnits: numberOfShares,
      createdIpAddress: ip,
    };

    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      purchaseDetails: [status, [{ tradeId, transactionAmount, transactionDate }]],
    } = response;

    return {
      tradeId,
      tradePrice: transactionAmount,
      tradeShares: numberOfShares,
      tradeStatus: 'CREATED',
      tradeDate: transactionDate,
    };
  }

  async createFundsTransfer(
    investmentId: string,
    accountId: string,
    offeringId: string,
    tradeId: string,
    externalAccountNickName: string,
    amount: Money,
    ipAddress: string,
  ): Promise<FundsMoveState> {
    const endpoint = 'tapiv3/index.php/v3/externalFundMove';
    const data = {
      accountId,
      offeringId,
      tradeId,
      NickName: externalAccountNickName,
      amount: amount.toUnit().toString(),
      description: `REINVEST Investment: ${investmentId}`,
      checkNumber: tradeId,
      createdIpAddress: ipAddress,
    };
    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      TradeFinancialDetails: [{ RefNum, fundStatus }],
    } = response;

    return { referenceNumber: RefNum, status: fundStatus };
  }
}
