import { ExecutionNorthCapitalAdapter } from 'Registration/Adapter/NorthCapital/ExecutionNorthCapitalAdapter';
import {
  VerificationEvent,
  VerificationNorthCapitalEvent,
  VerificationResultEvent,
  VerificationStatus,
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
        <VerificationNorthCapitalEvent>{
          date: new Date(),
          name: 'REQUEST_FAILED',
          kind: 'VerificationNorthCapitalEvent',
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
        <VerificationNorthCapitalEvent>{
          date: new Date(),
          name: 'REQUEST_FAILED',
          kind: 'VerificationNorthCapitalEvent',
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
        <VerificationNorthCapitalEvent>{
          date: new Date(),
          name: 'REQUEST_FAILED',
          kind: 'VerificationNorthCapitalEvent',
          ncId: partyId,
          reason: error.message,
        },
      ];
    }
  }

  private mapKycResponseToVerificationResultEvents(kyc: any, partyId: string): VerificationResultEvent[] {
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
      <VerificationResultEvent>{
        kind: 'VerificationResult',
        date: new Date(),
        ncId: partyId,
        reasons: qualifiers,
        source: 'DIRECT',
        status: this.mapVerificationStatus(kycStatus),
        type: 'KYC',
        eventId: `kyc-${verificationId}`,
        verificationWay: 'AUTOMATIC',
      },
      <VerificationResultEvent>{
        kind: 'VerificationResult',
        date: new Date(),
        ncId: partyId,
        reasons: [],
        source: 'DIRECT',
        status: this.mapVerificationStatus(amlStatus),
        type: 'AML',
        eventId: `aml-${verificationId}`,
        verificationWay: 'AUTOMATIC',
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

  async verifyEntityAml(partyId: string): Promise<VerificationEvent[]> {
    const endpoint = 'tapiv3/index.php/v3/performAml';
    const response = await this.postRequest(endpoint, { partyId });
    try {
      const { statusCode, statusDesc } = response;
      const amlResponse = response['partyDetails'];
      console.log({
        action: 'Automatic entity AML verification',
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
        <VerificationNorthCapitalEvent>{
          date: new Date(),
          name: 'REQUEST_FAILED',
          kind: 'VerificationNorthCapitalEvent',
          ncId: partyId,
          reason: error.message,
        },
      ];
    }
  }

  private mapAMLResponseToVerificationResultEvents(aml: any, partyId: string): VerificationResultEvent[] {
    const {
      response: { 'id-number': verificationId },
      amlStatus,
    } = aml;

    return [
      <VerificationResultEvent>{
        kind: 'VerificationResult',
        date: new Date(),
        ncId: partyId,
        reasons: [],
        source: 'DIRECT',
        status: this.mapVerificationStatus(amlStatus),
        type: 'AML',
        eventId: `aml-${verificationId}`,
        verificationWay: 'AUTOMATIC',
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
        <VerificationNorthCapitalEvent>{
          date: new Date(),
          name: 'REQUEST_FAILED',
          kind: 'VerificationNorthCapitalEvent',
          ncId: partyId,
          reason: error.message,
        },
      ];
    }
  }
}
