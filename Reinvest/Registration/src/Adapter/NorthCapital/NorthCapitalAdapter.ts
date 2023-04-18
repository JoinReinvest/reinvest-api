import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import { DictionaryType } from 'HKEKTypes/Generics';
import { ExecutionNorthCapitalAdapter } from 'Registration/Adapter/NorthCapital/ExecutionNorthCapitalAdapter';
import NorthCapitalException from 'Registration/Adapter/NorthCapital/NorthCapitalException';
import {
  NorthCapitalIndividualAccountStructure,
  NorthCapitalIndividualExtendedMainPartyStructure,
  NorthCapitalLinkConfiguration,
  NorthCapitalObjectType,
  NorthCapitalUploadedDocument,
} from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes';

import { MainParty } from '../../Domain/VendorModel/NorthCapital/MainParty';

export type NorthCapitalConfig = {
  API_URL: string;
  CLIENT_ID: string;
  DEVELOPER_API_KEY: string;
  OFFERING_ID: string;
};

export class NorthCapitalAdapter extends ExecutionNorthCapitalAdapter {
  static getClassName = () => 'NorthCapitalAdapter';

  async createParty(toCreate: DictionaryType): Promise<string | never> {
    const endpoint = 'tapiv3/index.php/v3/createParty';

    const response = await this.putRequest(endpoint, toCreate);
    const {
      statusCode,
      statusDesc,
      partyDetails: [status, [{ partyId }]],
    } = response;
    console.log({ action: 'Create north capital party', partyId, statusCode, statusDesc });

    return partyId;
  }

  async updateParty(northCapitalId: string, toUpdate: DictionaryType): Promise<void | never> {
    const endpoint = 'tapiv3/index.php/v3/updateParty';
    const data = {
      partyId: northCapitalId,
      ...toUpdate,
    };

    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      partyDetails: [status],
    } = response;
    console.log({ action: 'Update north capital party', northCapitalId, statusCode, statusDesc, status });
  }

  async getParty(partyId: string): Promise<object | never> {
    const endpoint = 'tapiv3/index.php/v3/getParty';

    const data = {
      partyId,
    };

    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      partyDetails: [party],
    } = response;

    console.log({ action: 'Get north capital party', partyId, statusCode, statusDesc });

    return party;
  }

  async createAccount(toCreate: DictionaryType): Promise<string | never> {
    const endpoint = 'tapiv3/index.php/v3/createAccount';
    const data = {
      domesticYN: 'domestic_account',
      KYCstatus: 'Pending',
      AMLstatus: 'Pending',
      AccreditedStatus: 'Pending',
      approvalStatus: 'Pending',
      ...toCreate,
    };

    const response = await this.putRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      accountDetails: [{ accountId }],
    } = response;

    console.log({ action: 'Create north capital individual account', accountId, statusCode, statusDesc });

    return accountId;
  }

  async updateAccount(northCapitalAccountId: string, accountData: DictionaryType): Promise<void | never> {
    const endpoint = 'tapiv3/index.php/v3/updateAccount';
    const data = {
      accountId: northCapitalAccountId,
      domesticYN: 'domestic_account',
      approvalStatus: 'Pending',
      ...accountData,
    };

    const response = await this.putRequest(endpoint, data);
    const { statusCode, statusDesc, accountDetails } = response;

    console.log({
      action: 'Update north capital individual account',
      northCapitalAccountId,
      statusCode,
      statusDesc,
      accountDetails,
    });
  }

  async linkEntityToAccount(entityId: string, accountId: string, linkConfiguration: NorthCapitalLinkConfiguration): Promise<string | never> {
    const endpoint = 'tapiv3/index.php/v3/createLink';
    const data = {
      firstEntryType: 'Account',
      firstEntry: accountId,
      relatedEntry: entityId,
      ...linkConfiguration,
    };

    try {
      const response = await this.putRequest(endpoint, data);
      const {
        statusCode,
        statusDesc,
        linkDetails: [status, [{ id: linkId }]],
      } = response;

      return linkId;
    } catch (error: any) {
      if (error.statusCode && error.statusCode == 206) {
        const existingLinks = await this.getAccountLinks(accountId);
        const existingLink = existingLinks.find(link => link.relatedEntry == entityId);

        if (!existingLink) {
          throw new Error(error.message);
        }

        return existingLink.linkId;
      } else {
        throw new Error(error.message);
      }
    }
  }

  async getAccountLinks(northCapitalAccountId: string): Promise<{ linkId: string; relatedEntry: string }[]> {
    const endpoint = 'tapiv3/index.php/v3/getAllLinks';
    const data = {
      accountId: northCapitalAccountId,
    };

    try {
      const response = await this.postRequest(endpoint, data);
      const { linkDetails } = response;

      return linkDetails.map((link: any) => {
        return {
          linkId: link.id,
          relatedEntry: link.relatedEntry,
        };
      });
    } catch (error: any) {
      console.error(`Retrieve all links for North Capital account ${northCapitalAccountId} failed`, error);

      return [];
    }
  }

  async getAllRawAccountLinks(northCapitalAccountId: string): Promise<any[]> {
    const endpoint = 'tapiv3/index.php/v3/getAllLinks';
    const data = {
      accountId: northCapitalAccountId,
    };

    try {
      const response = await this.postRequest(endpoint, data);
      const { linkDetails } = response;

      return linkDetails;
    } catch (error: any) {
      console.error(`Retrieve all links for North Capital account ${northCapitalAccountId} failed`, error);

      return [];
    }
  }

  async getAccount(accountId: string) {
    const endpoint = 'tapiv3/index.php/v3/getAccount';

    const data = {
      accountId,
    };

    const response = await this.postRequest(endpoint, data);
    const { statusCode, statusDesc, accountDetails: account } = response;

    console.log({ action: 'Get north capital account', accountId, statusCode, statusDesc });

    return account;
  }

  async uploadPartyDocument(
    northCapitalId: string,
    url: string,
    documentFilename: string,
    documentId: string,
    objectType: NorthCapitalObjectType,
  ): Promise<void | never> {
    const endpoint = objectType === NorthCapitalObjectType.PARTY ? 'tapiv3/index.php/v3/uploadPartyDocument' : 'tapiv3/index.php/v3/uploadEntityDocument';

    const data = {
      partyId: northCapitalId,
      documentTitle: `documentTitle0=${documentFilename} [id: ${documentId}]`,
      file_name: `filename0=${documentFilename}`,
    };

    try {
      const response = await this.sendFilePostRequest(endpoint, data, `userfile0`, url, documentFilename);
      const { statusCode, statusDesc, document_details: details } = response;

      console.log({
        action: 'Upload North Capital file to the party',
        northCapitalId,
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

  async getUploadedDocuments(northCapitalId: string): Promise<NorthCapitalUploadedDocument[]> {
    const endpoint = 'tapiv3/index.php/v3/getuploadPartyDocument';

    const data = {
      partyId: northCapitalId,
    };
    try {
      const response = await this.postRequest(endpoint, data);
      const { statusCode, statusDesc, partyDocumentDetails: details } = response;

      return details ?? [];
    } catch (error: any) {
      return [];
    }
  }

  async createEntity(entityData: DictionaryType): Promise<string | never> {
    const endpoint = 'tapiv3/index.php/v3/createEntity';

    const response = await this.putRequest(endpoint, entityData);
    const {
      statusCode,
      statusDesc,
      entityDetails: [status, [{ partyId: entityId }]],
    } = response;

    console.log({ action: 'Create north capital entity', statusCode, statusDesc, entityId });

    return entityId;
  }

  async updateEntity(northCapitalId: string, entityData: DictionaryType): Promise<void | never> {
    const endpoint = 'tapiv3/index.php/v3/updateEntity';

    const data = {
      partyId: northCapitalId,
      ...entityData,
    };

    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      entityDetails: [status, [{ partyId: entityId }]],
    } = response;

    console.log({ action: 'Update north capital entity', statusCode, statusDesc, entityId });
  }

  async getEntity(partyId: string): Promise<object | never> {
    const endpoint = 'tapiv3/index.php/v3/getEntity';

    const data = {
      partyId,
    };

    const response = await this.postRequest(endpoint, data);
    const {
      statusCode,
      statusDesc,
      entityDetails: [entity],
    } = response;

    console.log({ action: 'Get north capital entity', partyId, statusCode, statusDesc });

    return entity;
  }
}
