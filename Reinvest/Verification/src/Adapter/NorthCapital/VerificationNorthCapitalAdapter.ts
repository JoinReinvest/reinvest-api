import { ExecutionNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/ExecutionNorthCapitalAdapter';
import {
  VerificationAmlResultEvent,
  VerificationEvent,
  VerificationEvents,
  VerificationKycResultEvent,
  VerificationKycSetToPendingEvent,
  VerificationNorthCapitalObjectFailedEvent,
  AutomaticVerificationResultEvent,
  VerificationStatus,
  ManualVerificationKycResult,
  ManualVerificationAmlResult,
} from 'Verification/Domain/ValueObject/VerificationEvents';
import { NorthCapitalVerificationStatuses } from 'Verification/IntegrationLogic/NorthCapitalTypes';

export type NorthCapitalConfig = {
  API_URL: string;
  CLIENT_ID: string;
  DEVELOPER_API_KEY: string;
};

export class VerificationNorthCapitalAdapter extends ExecutionNorthCapitalAdapter {
  static getClassName = () => 'VerificationNorthCapitalAdapter';

  async verifyParty(partyId: string): Promise<VerificationEvent[]> {
    const endpoint = 'tapiv3/index.php/v3/performKycAmlBasic';
    const response = await this.postRequest(endpoint, { partyId });

    try {
      const { statusCode, statusDesc, kyc } = response;
      console.log({
        action: 'Automatic party verification',
        partyId,
        statusCode,
        statusDesc,
        kyc,
      });

      return this.mapKycResponseToVerificationResultEvents(kyc, partyId);
    } catch (error: any) {
      console.error({
        action: 'North Capital automatic kyc/aml verification on parties. Invalid response',
        partyId,
        response,
      });

      return [
        <VerificationNorthCapitalObjectFailedEvent>{
          date: new Date(),
          kind: VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
          ncId: partyId,
          reason: error.message,
        },
      ];
    }
  }

  async getPartyVerificationStatus(partyId: string): Promise<VerificationEvent[]> {
    const endpoint = 'tapiv3/index.php/v3/getKycAmlResponse';
    const response = await this.postRequest(endpoint, { partyId, type: 'Basic' });
    try {
      const { statusCode, statusDesc } = response;
      const kycResponse = response['kycamlDetails']['kyc'];
      console.log({
        action: 'Read verification status',
        partyId,
        statusCode,
        statusDesc,
        kycResponse,
      });

      return this.mapKycResponseToVerificationResultEvents(kycResponse, partyId);
    } catch (error: any) {
      console.error({
        action: 'North Capital automatic kyc/aml verification on parties. Invalid response',
        partyId,
        response,
      });

      return [
        <VerificationNorthCapitalObjectFailedEvent>{
          date: new Date(),
          kind: VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
          ncId: partyId,
          reason: error.message,
        },
      ];
    }
  }

  async getAmlVerificationOnly(partyId: string): Promise<VerificationEvent[]> {
    const endpoint = 'tapiv3/index.php/v3/getKycAmlResponse';
    const response = await this.postRequest(endpoint, { partyId, type: 'AML Only' });
    try {
      const { statusCode, statusDesc } = response;
      const amlResponse = response['kycamlDetails'];
      console.log({
        action: 'Read AML verification status',
        partyId,
        statusCode,
        statusDesc,
        amlResponse,
      });

      return this.mapAMLResponseToVerificationResultEvents(amlResponse, partyId);
    } catch (error: any) {
      console.error({
        action: 'North Capital automatic aml verification on entity. Invalid response',
        partyId,
        response,
      });

      return [
        <VerificationNorthCapitalObjectFailedEvent>{
          date: new Date(),
          kind: VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
          ncId: partyId,
          reason: error.message,
        },
      ];
    }
  }

  private mapKycResponseToVerificationResultEvents(kyc: any, partyId: string): AutomaticVerificationResultEvent[] {
    const {
      response: { 'id-number': verificationId },
      kycstatus: kycStatus,
      amlstatus: amlStatus,
    } = kyc;

    const qualifiers: string[] = [];

    if (kyc?.response?.results?.key && kyc?.response?.results?.message && kyc?.response?.results?.key !== 'result.match') {
      qualifiers.push(kyc?.response?.results?.message);
    }

    if (kyc?.response?.qualifiers?.qualifier) {
      const qualifier = kyc?.response?.qualifiers?.qualifier;

      if (Array.isArray(qualifier)) {
        qualifier.forEach((qualifier: any) => {
          qualifiers.push(qualifier?.message);
        });
      } else if (qualifier?.message) {
        qualifiers.push(qualifier?.message);
      }
    }

    return [
      <VerificationKycResultEvent>{
        kind: VerificationEvents.VERIFICATION_KYC_RESULT,
        date: new Date(),
        ncId: partyId,
        reasons: qualifiers,
        source: 'DIRECT',
        status: this.mapVerificationStatus(kycStatus),
        eventId: `kyc-${verificationId}`,
      },
      <VerificationAmlResultEvent>{
        kind: VerificationEvents.VERIFICATION_AML_RESULT,
        date: new Date(),
        ncId: partyId,
        reasons: [],
        source: 'DIRECT',
        status: this.mapVerificationStatus(amlStatus),
        eventId: `aml-${verificationId}`,
      },
    ];
  }

  private mapVerificationStatus(status: NorthCapitalVerificationStatuses): VerificationStatus {
    switch (status) {
      case NorthCapitalVerificationStatuses['Auto Approved']:
      case NorthCapitalVerificationStatuses['Manually Approved']:
        return VerificationStatus.APPROVED;
      case NorthCapitalVerificationStatuses.Pending:
        return VerificationStatus.PENDING;
      case NorthCapitalVerificationStatuses.Disapproved:
        return VerificationStatus.DISAPPROVED;
      default:
        return VerificationStatus.PENDING;
    }
  }

  async verifyAmlOnly(partyId: string): Promise<VerificationEvent[]> {
    const endpoint = 'tapiv3/index.php/v3/performAml';
    const response = await this.postRequest(endpoint, { partyId });
    try {
      const { statusCode, statusDesc } = response;
      const amlResponse = response['partyDetails'];
      console.log({
        action: 'Automatic AML verification',
        partyId,
        statusCode,
        statusDesc,
        amlResponse,
      });

      return this.mapAMLResponseToVerificationResultEvents(amlResponse, partyId);
    } catch (error: any) {
      console.error({
        action: 'North Capital automatic aml verification. Invalid response',
        partyId,
        response,
      });

      return [
        <VerificationNorthCapitalObjectFailedEvent>{
          date: new Date(),
          kind: VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
          ncId: partyId,
          reason: error.message,
        },
      ];
    }
  }

  private mapAMLResponseToVerificationResultEvents(aml: any, partyId: string): VerificationAmlResultEvent[] {
    const {
      response: { 'id-number': verificationId },
      amlStatus,
    } = aml;

    return [
      <VerificationAmlResultEvent>{
        kind: VerificationEvents.VERIFICATION_AML_RESULT,
        date: new Date(),
        ncId: partyId,
        reasons: [],
        source: 'DIRECT',
        status: this.mapVerificationStatus(amlStatus),
        eventId: `aml-${verificationId}`,
      },
    ];
  }

  async getEntityVerificationStatus(partyId: string): Promise<VerificationEvent[]> {
    const endpoint = 'tapiv3/index.php/v3/getKycAml'; // todo how to verify kyb status?
    const response = await this.postRequest(endpoint, { partyId });
    try {
      const { statusCode, statusDesc } = response;
      // const kycResponse = response['kycamlDetails']['kyc'];
      // console.log({
      //   action: 'Read verification status',
      //   partyId,
      //   statusCode,
      //   statusDesc,
      //   kycResponse,
      // });

      return [];
    } catch (error: any) {
      console.error({
        action: 'North Capital automatic kyc/aml verification on parties. Invalid response',
        partyId,
        response,
      });

      return [
        <VerificationNorthCapitalObjectFailedEvent>{
          date: new Date(),
          kind: VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
          ncId: partyId,
          reason: error.message,
        },
      ];
    }
  }

  async setPartyKycStatusToPending(partyId: string): Promise<VerificationEvent> {
    const endpoint = 'tapiv3/index.php/v3/updateParty';
    const data = {
      partyId,
      KYCstatus: 'Pending',
    };

    try {
      const response = await this.postRequest(endpoint, data);
      const {
        statusCode,
        statusDesc,
        partyDetails: [status, [{ KYCstatus: kycStatus }]],
      } = response;
      console.log({
        action: 'Update north capital KYC for party to Pending',
        partyId,
        statusCode,
        statusDesc,
        status,
        kycStatus,
      });

      if (kycStatus !== 'Pending') {
        throw new Error(`North Capital KYC status is not pending. Status: ${kycStatus} for ${partyId}`);
      }

      return <VerificationKycSetToPendingEvent>{
        date: new Date(),
        kind: VerificationEvents.VERIFICATION_KYC_SET_TO_PENDING,
        ncId: partyId,
      };
    } catch (error: any) {
      console.error(error);

      return <VerificationNorthCapitalObjectFailedEvent>{
        date: new Date(),
        kind: VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
        ncId: partyId,
        reason: error.message,
      };
    }
  }

  async getPartyKycAmlStatus(partyId: string): Promise<VerificationEvent[]> {
    const endpoint = 'tapiv3/index.php/v3/getParty';
    const data = {
      partyId,
    };

    try {
      const response = await this.postRequest(endpoint, data);
      const {
        statusCode,
        statusDesc,
        partyDetails: [{ kycStatus, amlStatus }],
      } = response;
      console.log({
        action: 'Get north capital KYC for party (for manual verification)',
        partyId,
        statusCode,
        statusDesc,
        kycStatus,
        amlStatus,
      });

      if (kycStatus === 'Pending') {
        return [
          <VerificationKycSetToPendingEvent>{
            date: new Date(),
            kind: VerificationEvents.VERIFICATION_KYC_SET_TO_PENDING,
            ncId: partyId,
          },
        ];
      }

      return [
        <ManualVerificationKycResult>{
          kind: VerificationEvents.MANUAL_VERIFICATION_KYC_RESULT,
          date: new Date(),
          ncId: partyId,
          reasons: [],
          source: 'DIRECT',
          status: this.mapVerificationStatus(kycStatus),
        },
        <ManualVerificationAmlResult>{
          kind: VerificationEvents.MANUAL_VERIFICATION_AML_RESULT,
          date: new Date(),
          ncId: partyId,
          reasons: [],
          source: 'DIRECT',
          status: this.mapVerificationStatus(amlStatus),
        },
      ];
    } catch (error: any) {
      console.error(error);

      return [
        <VerificationNorthCapitalObjectFailedEvent>{
          date: new Date(),
          kind: VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
          ncId: partyId,
          reason: error.message,
        },
      ];
    }
  }
}
