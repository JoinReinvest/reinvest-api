import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import moment from 'moment';

import NorthCapitalException from './NorthCapitalException';

export default class NorthCapitalRequester {
  clientId: string;
  developerAPIKey: string;
  url: string;

  constructor(clientId: string, developerAPIKey: string, url: string) {
    this.clientId = clientId;
    this.developerAPIKey = developerAPIKey;
    this.url = url;
  }

  public async linkExternalAchAccount(accountId: string): Promise<string> {
    const endpoint = 'tapiv3/index.php/v3/linkExternalAccount';
    const data = {
      accountId,
    };

    const { statusCode, statusDesc, accountDetails: integrationLink } = await this.postRequest(endpoint, data);

    return integrationLink;
  }

  async createExternalAchAccount(
    id: string,
    fullName: string,
    nickName: string,
    bankName: string,
    bankRoutingNumber: string,
    bankAccountNumber: string,
    ipAddress: string,
    type: 'Issuer Account' | 'Account' = 'Account',
    accountType: 'Checking' | 'Saving' = 'Checking',
  ): Promise<boolean> {
    const endpoint = 'tapiv3/index.php/v3/createExternalAccount';
    const accountIdKey = type === 'Account' ? 'accountId' : 'issuerId';
    const data = {
      [accountIdKey]: id,
      types: type,
      ExtAccountfullname: fullName,
      ExtRoutingnumber: bankRoutingNumber,
      ExtAccountnumber: bankAccountNumber,
      Extnickname: nickName,
      ExtBankname: bankName,
      updatedIpAddress: ipAddress,
      accountType,
    };
    let statusCode;
    try {
      const response = await this.postRequest(endpoint, data);
      statusCode = response.statusCode;
    } catch (error: NorthCapitalException | any) {
      statusCode = error.getStatus();
    }

    return statusCode === 101;
  }

  async createAccount(
    investorAccountName: string,
    type: 'Individual' | 'Entity',
    accountOrigin: 'domestic_account' | 'international_account',
    streetAddress: string,
    city: string,
    state: string,
    zip: string,
    country: string,
    KycStatus: 'Pending' | 'Auto Approved' | 'Manually Approved' | 'Disapproved',
    AmlStatus: 'Pending' | 'Auto Approved' | 'Manually Approved' | 'Disapproved',
    accreditedStatus: 'Pending' | 'Self Accredited' | 'Verified Accredited' | 'Not Accredited',
    principalApprovalStatus: 'Pending' | 'Approved' | 'Not Approve',
  ): Promise<string> {
    const endpoint = 'tapiv3/index.php/v3/createAccount';
    const data = {
      accountRegistration: investorAccountName,
      type,
      domesticYN: accountOrigin,
      streetAddress1: streetAddress,
      city,
      state,
      zip,
      country,
      KYCstatus: KycStatus,
      AMLstatus: AmlStatus,
      AccreditedStatus: accreditedStatus,
      approvalStatus: principalApprovalStatus,
    };

    const response = await this.putRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      accountDetails: [{ accountId }],
    } = response;

    return accountId;
  }

  async createParty(
    domicile: 'U.S. Citizen' | 'U.S. Resident' | 'non-resident',
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    streetAddress: string,
    city: string,
    state: string,
    zip: string,
    country: string,
    email: string,
  ): Promise<string> {
    const endpoint = 'tapiv3/index.php/v3/createParty';
    const data = {
      firstName,
      lastName,
      domicile,
      dob: moment(dateOfBirth).format('MM-DD-YYYY'),
      primCountry: country,
      primAddress1: streetAddress,
      primCity: city,
      primState: state,
      primZip: zip,
      emailAddress: email,
    };

    const response = await this.putRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      partyDetails: [status, [{ partyId }]],
    } = response;

    return partyId;
  }

  async linkPartyToAccount(
    accountId: string,
    relatedEntryType: 'Account' | 'IndivACParty' | 'EntityACParty',
    relatedEntryId: string,
    linkType:
      | 'owner'
      | 'manager'
      | 'member'
      | 'officer'
      | 'director'
      | 'spouse'
      | 'beneficiary'
      | 'trustee'
      | 'custodian'
      | 'parentco'
      | 'subsidiary'
      | 'other'
      | 'acgroup'
      | 'advisor'
      | 'attorney'
      | 'proxy',
    isMainParty: boolean,
  ): Promise<string> {
    const endpoint = 'tapiv3/index.php/v3/createLink';
    const data = {
      firstEntryType: 'Account',
      firstEntry: accountId,
      relatedEntryType,
      relatedEntry: relatedEntryId,
      linkType,
      primary_value: isMainParty ? 1 : 0,
    };

    const response = await this.putRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      linkDetails: [status, [{ id: linkId }]],
    } = response;

    return linkId;
  }

  async createTrade(
    offeringId: string,
    accountId: string,
    transactionType: 'ACH' | 'WIRE' | 'CHECK' | 'CREDITCARD' | 'TBD/IRA',
    numberOfShares: string,
    ipAddress: string,
  ) {
    const endpoint = 'tapiv3/index.php/v3/createTrade';
    const data = {
      offeringId,
      accountId,
      transactionType,
      transactionUnits: numberOfShares,
      createdIpAddress: ipAddress,
    };

    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      purchaseDetails: [status, [{ tradeId, transactionId }]],
    } = response;

    return tradeId;
  }

  async createEscrowAccount(offeringId: string, overFundingAmount: string, bankName: string, offeringAccountNumber: string, accountFullName: string) {
    const endpoint = 'tapiv3/index.php/v3/createEscrowAccount';
    const data = {
      offeringId,
      overFundingAmount,
      bankName,
      offeringAccountNumber,
      accountFullName,
    };

    const response = await this.putRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      'Financial Escrow Details': [status, [statusAgain, [{ issuerId, escrowAccountStatus }]]],
    } = response;

    return escrowAccountStatus;
  }

  async moveFundsFromExternalAccounts(
    accountId: string,
    offeringId: string,
    tradeId: string,
    externalAccountNickName: string,
    amount: string,
    description: string,
    ipAddress: string,
  ): Promise<string> {
    const endpoint = 'tapiv3/index.php/v3/externalFundMove';
    const data = {
      accountId,
      offeringId,
      tradeId,
      NickName: externalAccountNickName,
      amount,
      description,
      checkNumber: tradeId,
      createdIpAddress: ipAddress,
    };
    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      TradeFinancialDetails: [{ RefNum, fundStatus }],
    } = response;

    return RefNum;
  }

  async getExternalFundMoveInfo(accountId: string, fundsTransferRefNumber: string): Promise<string> {
    const endpoint = 'tapiv3/index.php/v3/getExternalFundMoveInfo';
    const data = {
      accountId,
      RefNum: fundsTransferRefNumber,
    };
    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      investorExternalAccountDetails: { fundStatus: status, error },
    } = response;

    return status;
  }

  async getExternalFundMoveDetails(accountId: string, fundsTransferRefNumber: string): Promise<any> {
    const endpoint = 'tapiv3/index.php/v3/getExternalFundMove';
    const data = {
      accountId,
      RefNum: fundsTransferRefNumber,
    };
    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      investorExternalAccountDetails: [details],
    } = response;

    return details;
  }

  async getTradeHistory(accountId: string, tradeId: string): Promise<any> {
    const endpoint = 'tapiv3/index.php/v3/getTrade';
    const data = {
      accountId,
      tradeId,
    };
    const response = await this.postRequest(endpoint, data);
    const { statusCode, statusDesc, partyDetails: tradeHistory } = response;

    return tradeHistory;
  }

  async getAchPendingTransactionsForAccount(accountId: string): Promise<any[]> {
    const endpoint = 'tapiv3/index.php/v3/getAchPendingId';
    const data = {
      accountId,
    };
    const response = await this.postRequest(endpoint, data);
    const { statusCode, statusDesc, investorExternalAccountDetails: listOfTransactions } = response;

    return listOfTransactions;
  }

  async performBasicVerification(partyId: string) {
    const endpoint = 'tapiv3/index.php/v3/performKycAmlBasic';
    const data = {
      partyId,
    };
    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      kyc: { kycstatus, amlstatus, response: details },
    } = response;

    return {
      kyc: kycstatus,
      aml: amlstatus,
      details,
    };
  }

  async createEntity(
    domicile: 'U.S. Citizen' | 'U.S. Resident' | 'non-resident',
    entityName: string,
    country: string,
    streetAddress: string,
    city: string,
    state: string,
    zip: string,
    email: string,
    ipAddress: string,
  ) {
    const endpoint = 'tapiv3/index.php/v3/createEntity';
    const data = {
      domicile,
      entityName,
      primCountry: country,
      primAddress1: streetAddress,
      primCity: city,
      primState: state,
      primZip: zip,
      emailAddress: email,
      createdIpAddress: ipAddress,
    };

    const response = await this.putRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      entityDetails: [status, [{ partyId }]],
    } = response;

    return partyId;
  }

  async getAccountDetails(accountId: string): Promise<any> {
    const endpoint = 'tapiv3/index.php/v3/getAccount';
    const data = {
      accountId,
    };

    const response = await this.postRequest(endpoint, data);
    const { statusCode, statusDesc, accountDetails: details } = response;

    return details;
  }

  /**
   * List the latest trade state with totalAmount price investor paid, but without number of shares
   * so based on that we are not able to calculate original unit share price
   * @param accountId
   */
  async getAccountTrades(accountId: string): Promise<any[]> {
    const endpoint = 'tapiv3/index.php/v3/getAccountTradeHistory';
    const data = {
      accountId,
    };

    const response = await this.postRequest(endpoint, data);
    const { statusCode, statusDesc, accountDetails: trades } = response;

    return trades;
  }

  async listOfferingPurchaseHistory(offeringId: string): Promise<any[]> {
    const endpoint = 'tapiv3/index.php/v3/getOfferingPurchaseHistory';
    const data = {
      offeringId,
    };

    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      'Offering purchased details': { offering_purchase_history: purchaseHistory },
    } = response;

    return purchaseHistory;
  }

  async getOfferingDetails(offeringId: string): Promise<any> {
    const endpoint = 'tapiv3/index.php/v3/getOfferingDetails';
    const data = {
      offeringId,
    };

    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      'Offering purchased details': [details],
    } = response;

    return details;
  }

  async getOfferingPurchaseDetails(offeringId: string): Promise<any> {
    const endpoint = 'tapiv3/index.php/v3/getOfferingPurchaseHistory';
    const data = {
      offeringId,
    };

    const response = await this.postRequest(endpoint, data);

    const { statusCode, statusDesc, 'Offering purchased details': details } = response;

    return details;
  }

  async getOffering(offeringId: string): Promise<any> {
    const endpoint = 'tapiv3/index.php/v3/getOffering';
    const data = {
      offeringId,
    };

    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      offeringDetails: [details],
    } = response;

    return details;
  }

  async getOfferingEscrowAccount(offeringId: string): Promise<any> {
    const endpoint = 'tapiv3/index.php/v3/getEscrowAccount';
    const data = {
      offeringId,
    };

    const response = await this.postRequest(endpoint, data);
    const { statusCode, statusDesc, 'Financial Escrow Details': details } = response;

    return details;
  }

  private async putRequest(endpoint: string, data: any): Promise<any> {
    try {
      const putData = this.extendWithCredentials(data);
      const response: AxiosResponse = await axios.put(`${this.url}/${endpoint}`, putData);

      return response.data;
    } catch (error) {
      const {
        response: {
          data: { statusCode, statusDesc },
        },
      } = error;
      throw new NorthCapitalException(statusCode, statusDesc);
    }
  }

  private async postRequest(endpoint: string, data: any): Promise<any> {
    try {
      const formData = this.transformToFormData(data);
      const response: AxiosResponse = await axios.post(`${this.url}/${endpoint}`, formData);

      return response.data;
    } catch (error) {
      const {
        response: {
          data: { statusCode, statusDesc },
        },
      } = error;
      throw new NorthCapitalException(statusCode, statusDesc);
    }
  }

  private transformToFormData(data: any): FormData {
    const extendedData = this.extendWithCredentials(data);
    const formData = new FormData();

    for (const key of Object.keys(extendedData)) {
      formData.append(key, extendedData[key]);
    }

    return formData;
  }

  private extendWithCredentials(data: any): any {
    return {
      clientID: this.clientId,
      developerAPIKey: this.developerAPIKey,
      ...data,
    };
  }
}
