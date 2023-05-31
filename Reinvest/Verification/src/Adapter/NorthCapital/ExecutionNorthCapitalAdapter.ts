import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import NorthCapitalException from 'Verification/Adapter/NorthCapital/NorthCapitalException';
import { NorthCapitalConfig } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';

export abstract class ExecutionNorthCapitalAdapter {
  clientId: string;
  developerAPIKey: string;
  url: string;

  protected constructor({ CLIENT_ID: clientId, DEVELOPER_API_KEY: developerAPIKey, API_URL: url }: NorthCapitalConfig) {
    this.clientId = clientId;
    this.developerAPIKey = developerAPIKey;
    this.url = url;
  }

  protected async putRequest(endpoint: string, data: any): Promise<any> {
    try {
      const putData = this.extendWithCredentials(data);
      const response: AxiosResponse = await axios.put(`${this.url}/${endpoint}`, putData);

      return response.data;
    } catch (error: any) {
      const {
        response: {
          data: { statusCode, statusDesc },
        },
      } = error;
      throw new NorthCapitalException(statusCode, statusDesc);
    }
  }

  protected async postRequest(endpoint: string, data: any): Promise<any> {
    try {
      console.log('Verification NC, post request', endpoint, data);
      const formData = this.transformToFormData(data);
      const response: AxiosResponse = await axios.post(`${this.url}/${endpoint}`, formData);
      console.log('Verification NC, post request', endpoint, data, JSON.stringify(response));

      return response.data;
    } catch (error: any) {
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
