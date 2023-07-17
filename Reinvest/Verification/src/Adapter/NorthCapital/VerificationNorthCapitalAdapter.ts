import { DateTime } from 'Money/DateTime';
import { ExecutionNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/ExecutionNorthCapitalAdapter';
import {
  ManualVerificationAmlResult,
  ManualVerificationKycResult,
  VerificationAmlResultEvent,
  VerificationEvent,
  VerificationEvents,
  VerificationKycResultEvent,
  VerificationKycSetToPendingEvent,
  VerificationNorthCapitalObjectFailedEvent,
} from 'Verification/Domain/ValueObject/VerificationEvents';
import { mapVerificationStatus } from 'Verification/IntegrationLogic/NorthCapitalTypes';

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
          date: DateTime.now().toDate(),
          kind: VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
          ncId: partyId,
          reason: error.message,
        },
      ];
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
          date: DateTime.now().toDate(),
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
        date: DateTime.now().toDate(),
        kind: VerificationEvents.VERIFICATION_KYC_SET_TO_PENDING,
        ncId: partyId,
      };
    } catch (error: any) {
      console.error(error);

      return <VerificationNorthCapitalObjectFailedEvent>{
        date: DateTime.now().toDate(),
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
            date: DateTime.now().toDate(),
            kind: VerificationEvents.VERIFICATION_KYC_SET_TO_PENDING,
            ncId: partyId,
          },
        ];
      }

      return [
        <ManualVerificationKycResult>{
          kind: VerificationEvents.MANUAL_VERIFICATION_KYC_RESULT,
          date: DateTime.now().toDate(),
          ncId: partyId,
          reasons: [],
          source: 'DIRECT',
          status: mapVerificationStatus(kycStatus),
        },
        <ManualVerificationAmlResult>{
          kind: VerificationEvents.MANUAL_VERIFICATION_AML_RESULT,
          date: DateTime.now().toDate(),
          ncId: partyId,
          reasons: [],
          source: 'DIRECT',
          status: mapVerificationStatus(amlStatus),
        },
      ];
    } catch (error: any) {
      console.error(error);

      return [
        <VerificationNorthCapitalObjectFailedEvent>{
          date: DateTime.now().toDate(),
          kind: VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
          ncId: partyId,
          reason: error.message,
        },
      ];
    }
  }

  async setEntityKycStatusToPending(partyId: string): Promise<VerificationEvent> {
    const endpoint = 'tapiv3/index.php/v3/updateEntity';
    const data = {
      partyId,
      KYCstatus: 'Pending',
    };

    try {
      const response = await this.postRequest(endpoint, data);
      const { statusCode, statusDesc } = response;
      console.log({
        action: 'Update north capital KYC for entity to Pending',
        partyId,
        statusCode,
        statusDesc,
      });

      return <VerificationKycSetToPendingEvent>{
        date: DateTime.now().toDate(),
        kind: VerificationEvents.VERIFICATION_KYC_SET_TO_PENDING,
        ncId: partyId,
      };
    } catch (error: any) {
      console.error(error);

      return <VerificationNorthCapitalObjectFailedEvent>{
        date: DateTime.now().toDate(),
        kind: VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
        ncId: partyId,
        reason: error.message,
      };
    }
  }

  async getEntityKycAmlStatus(partyId: string): Promise<VerificationEvent[]> {
    const endpoint = 'tapiv3/index.php/v3/getEntity';
    const data = {
      partyId,
    };

    try {
      const response = await this.postRequest(endpoint, data);
      const {
        statusCode,
        statusDesc,
        entityDetails: [{ KYCstatus: kycStatus, AMLstatus: amlStatus }],
      } = response;
      console.log({
        action: 'Get north capital KYB/AML for entity (for manual verification)',
        partyId,
        statusCode,
        statusDesc,
        kycStatus,
        amlStatus,
      });

      if (kycStatus === 'Pending') {
        return [
          <VerificationKycSetToPendingEvent>{
            date: DateTime.now().toDate(),
            kind: VerificationEvents.VERIFICATION_KYC_SET_TO_PENDING,
            ncId: partyId,
          },
        ];
      }

      return [
        <ManualVerificationKycResult>{
          kind: VerificationEvents.MANUAL_VERIFICATION_KYC_RESULT,
          date: DateTime.now().toDate(),
          ncId: partyId,
          reasons: [],
          source: 'DIRECT',
          status: mapVerificationStatus(kycStatus),
        },
        <ManualVerificationAmlResult>{
          kind: VerificationEvents.MANUAL_VERIFICATION_AML_RESULT,
          date: DateTime.now().toDate(),
          ncId: partyId,
          reasons: [],
          source: 'DIRECT',
          status: mapVerificationStatus(amlStatus),
        },
      ];
    } catch (error: any) {
      console.error(error);

      return [
        <VerificationNorthCapitalObjectFailedEvent>{
          date: DateTime.now().toDate(),
          kind: VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
          ncId: partyId,
          reason: error.message,
        },
      ];
    }
  }

  private mapKycResponseToVerificationResultEvents(kyc: any, partyId: string): VerificationEvent[] {
    const {
      response: { 'id-number': verificationId },
      kycstatus: kycStatus,
      amlstatus: amlStatus,
    } = kyc;

    if (kycStatus === 'Pending') {
      return [
        <VerificationKycSetToPendingEvent>{
          date: DateTime.now().toDate(),
          kind: VerificationEvents.VERIFICATION_KYC_SET_TO_PENDING,
          ncId: partyId,
        },
      ];
    }

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
        date: DateTime.now().toDate(),
        ncId: partyId,
        reasons: qualifiers,
        source: 'DIRECT',
        status: mapVerificationStatus(kycStatus),
        eventId: `kyc-${verificationId}`,
      },
      <VerificationAmlResultEvent>{
        kind: VerificationEvents.VERIFICATION_AML_RESULT,
        date: DateTime.now().toDate(),
        ncId: partyId,
        reasons: [],
        source: 'DIRECT',
        status: mapVerificationStatus(amlStatus),
        eventId: `aml-${verificationId}`,
      },
    ];
  }

  private mapAMLResponseToVerificationResultEvents(aml: any, partyId: string): VerificationAmlResultEvent[] {
    const {
      response: { 'id-number': verificationId },
      amlStatus,
    } = aml;

    return [
      <VerificationAmlResultEvent>{
        kind: VerificationEvents.VERIFICATION_AML_RESULT,
        date: DateTime.now().toDate(),
        ncId: partyId,
        reasons: [],
        source: 'DIRECT',
        status: mapVerificationStatus(amlStatus),
        eventId: `aml-${verificationId}`,
      },
    ];
  }
}
