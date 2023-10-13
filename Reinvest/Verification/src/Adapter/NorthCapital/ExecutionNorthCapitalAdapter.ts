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
      const formData = this.transformToFormData(data);
      const response: AxiosResponse = await axios.post(`${this.url}/${endpoint}`, formData);

      console.log('1-------------------')
      console.log(`${this.url}/${endpoint}`)
      console.log(formData)
      console.log('1.5---------')
      console.log(response)
      console.log('2-------------------')

      return response.data;
    } catch (error: any) {
      const {
        response: {
          data: { statusCode, statusDesc },
        },
      } = error;

      console.log(error)

      throw new NorthCapitalException(statusCode, statusDesc);
    }
  }

  private transformToFormData(data: any): FormData {
    console.log('123--------')
    console.log(data)
    console.log('1234--------')
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
