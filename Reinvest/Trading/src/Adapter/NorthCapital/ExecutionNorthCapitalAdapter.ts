import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import https from 'https';
import NorthCapitalException from 'Trading/Adapter/NorthCapital/NorthCapitalException';
import { NorthCapitalConfig } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';

export abstract class ExecutionNorthCapitalAdapter {
  clientId: string;
  developerAPIKey: string;
  url: string;

  protected constructor({ CLIENT_ID: clientId, DEVELOPER_API_KEY: developerAPIKey, API_URL: url }: NorthCapitalConfig) {
    this.clientId = clientId;
    this.developerAPIKey = developerAPIKey;
    this.url = url;
  }

  protected async postRequest(endpoint: string, data: any): Promise<any> {
    try {
      const formData = this.transformToFormData(data);
      const response: AxiosResponse = await axios.post(`${this.url}/${endpoint}`, formData);

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

  protected async sendFilePostRequest(endpoint: string, data: any, fileKey: string, fileUrl: string, fileName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const formData = this.transformToFormData(data);
        https.get(fileUrl, async (stream: any) => {
          try {
            formData.append(fileKey, stream, fileName);

            const response: AxiosResponse = await axios.post(`${this.url}/${endpoint}`, formData);

            resolve(response.data);
          } catch (error: any) {
            const {
              response: { status },
            } = error;

            if (status === 404) {
              reject('FILE_NOT_FOUND');
            } else {
              reject(error);
            }
          }
        });
      } catch (error) {
        reject(error);
      }
    });
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
