import dayjs from 'dayjs';
import { Money } from 'Money/Money';
import NorthCapitalException from 'Registration/Adapter/NorthCapital/NorthCapitalException';
import { ExecutionNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/ExecutionNorthCapitalAdapter';
import { FundsMoveState, NorthCapitalTradeState } from 'Trading/Domain/Trade';
import { TradeApproval, TradeVerificationDecision } from 'Trading/Domain/TradeVerification';
import { TradeStatus } from 'Trading/IntegrationLogic/NorthCapitalTypes';

export type NorthCapitalConfig = {
  API_URL: string;
  CLIENT_ID: string;
  DEVELOPER_API_KEY: string;
};

export type NorthCapitalUploadedTradeDocument = {
  createdDate: string;
  documentFileName: string;
  documentFileReferenceCode: string;
  documentTitle: string;
  documentUrl: string;
  documentid: string;
  tradeId: string;
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
      tradeVerification: {
        decision: TradeVerificationDecision.PENDING,
        events: [],
      },
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
    try {
      const response = await this.postRequest(endpoint, data);
      const {
        statusCode,
        statusDesc,
        TradeFinancialDetails: [{ fundStatus }],
      } = response;

      return { status: fundStatus };
    } catch (error: any) {
      if (error.statusCode && error.statusCode === '150') {
        // External Fund Move Already in Process for this trade.
        return { status: 'Pending' };
      } else {
        throw new Error(error.message);
      }
    }
  }

  async uploadSubscriptionAgreementToTrade(tradeId: string, url: string, subscriptionAgreementId: string): Promise<boolean> {
    if (await this.checkIfFileExistsInTrade(tradeId, subscriptionAgreementId)) {
      console.log(`Subscription agreement ${subscriptionAgreementId} already exists in North Capital for trade ${tradeId}`);
    } else {
      await this.uploadTradeDocument(tradeId, url, 'subscription-agreement.pdf', subscriptionAgreementId);
    }

    return true; // if fails, it will throw an exception
  }

  /**
   * @note This method is used only for integrations tests
   * @param tradeId
   * @param accountId
   * @param tradeState
   */
  async updateTradeStatusForTests(tradeId: string, accountId: string, tradeState: 'SETTLED' | 'FUNDED' | 'UNWIND SETTLED' | 'CREATED'): Promise<any> {
    const endpoint = 'tapiv3/index.php/v3/updateTradeStatus';
    const data = {
      tradeId,
      accountId,
      orderStatus: tradeState,
    };

    const response = await this.postRequest(endpoint, data);
    const { statusCode, statusDesc, tradeDetails } = response;

    return tradeDetails;
  }

  /**
   * @note This method is used only for integrations tests
   * @param tradeId
   * @param accountId
   * @param tradeState
   */
  async updateTradePrincipalApprovalForTests(
    tradeId: string,
    accountId: string,
    orderStatus: string,
    rrApproval: 'Pending' | 'Approved' | 'Disapproved' | 'Under Review',
    field3: string = '',
  ): Promise<any> {
    const endpoint = 'tapiv3/index.php/v3/updateTradeStatus';
    const data = {
      tradeId,
      accountId,
      orderStatus,
      field3,
      RRApprovalStatus: rrApproval,
    };

    const response = await this.postRequest(endpoint, data);
    const { statusCode, statusDesc, tradeDetails } = response;

    return tradeDetails;
  }

  async getTradeStatus(tradeId: string): Promise<TradeStatus> {
    const { orderStatus } = await this.getCurrentTradeState(tradeId);

    return TradeStatus.fromResponse(orderStatus);
  }

  async getCurrentTradeState(tradeId: string): Promise<any> {
    const endpoint = 'tapiv3/index.php/v3/getTradeStatus';
    const data = {
      tradeId,
    };
    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      tradeDetails: [tradeDetails],
    } = response;

    return tradeDetails;
  }

  async markTradeAsReadyToDisburse(tradeId: string): Promise<boolean> {
    const { orderStatus, accountId } = await this.getCurrentTradeState(tradeId);
    const endpoint = 'tapiv3/index.php/v3/updateTradeStatus';
    const message = `REINVEST: Ready to disburse, ${dayjs().format('MM/DD/YYYY')}`;
    const data = {
      orderStatus,
      accountId,
      tradeId,
      field2: message,
    };

    const response = await this.postRequest(endpoint, data);

    return true;
  }

  async cancelTrade(
    tradeId: string,
    userEmail: string,
    reason: string,
  ): Promise<{
    details: any;
    status: string;
  }> {
    const endpoint = 'tapiv3/index.php/v3/cancelInvestment';
    const data = {
      tradeId,
      requestedBy: userEmail,
      reason,
      notes: reason,
    };

    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      'Canceled investment details': [cancelDetails],
    } = response;

    const { orderStatus } = cancelDetails;

    return {
      status: orderStatus,
      details: cancelDetails,
    };
  }

  private async checkIfFileExistsInTrade(northCapitalId: string, documentId: string): Promise<boolean> {
    const uploadedDocuments = await this.getUploadedTradeDocuments(northCapitalId);
    const documentIdRegex = new RegExp(`.*(${documentId}).*`);

    for (const document of uploadedDocuments) {
      const { documentTitle } = document;

      if (documentIdRegex.test(documentTitle)) {
        return true;
      }
    }

    return false;
  }

  private async getUploadedTradeDocuments(tradeId: string): Promise<NorthCapitalUploadedTradeDocument[]> {
    const endpoint = 'tapiv3/index.php/v3/getTradeDocument';

    const data = {
      tradeId,
    };
    try {
      const response = await this.postRequest(endpoint, data);
      const { statusCode, statusDesc, document_details: details } = response;

      return details ?? [];
    } catch (error: any) {
      return [];
    }
  }

  private async uploadTradeDocument(tradeId: string, url: string, documentFilename: string, documentId: string): Promise<void | never> {
    const endpoint = 'tapiv3/index.php/v3/uploadTradeDocument';

    const data = {
      tradeId,
      documentTitle: `documentTitle0=[id:${documentId}]-${documentFilename}`,
      file_name: `filename0=${documentFilename}`,
    };

    try {
      const response = await this.sendFilePostRequest(endpoint, data, `userfile0`, url, documentFilename);
      const { statusCode, statusDesc, document_details: details } = response;

      console.log({
        action: 'Upload North Capital file to the trade',
        tradeId,
        statusCode,
        statusDesc,
        details,
      });
    } catch (error: any) {
      if (error === 'FILE_NOT_FOUND') {
        throw new NorthCapitalException(404, error);
      }

      const {
        response: {
          data: { statusCode, statusDesc },
        },
      } = error;

      if (statusCode && statusDesc) {
        throw new NorthCapitalException(statusCode, statusDesc);
      } else {
        throw new Error(error.message);
      }
    }
  }

  async getTradeApproval(tradeId: string): Promise<TradeApproval> {
    const { RRApprovalStatus, field3, RRApprovalDate } = await this.getCurrentTradeState(tradeId);

    return {
      approvalStatus: RRApprovalStatus.toLowerCase(),
      message: field3,
      changeDate: RRApprovalDate,
    };
  }
}
