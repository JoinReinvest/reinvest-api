import axios, { AxiosInstance, AxiosResponse } from 'axios';

import { GetPropertiesResponse, GetPropertyResponse } from './types';

export type DealpathConfig = {
  API_URL: string;
  AUTHORIZATION_TOKEN: string;
  VERSION_HEADER: string;
};

export class DealpathAdapter {
  version_header: string;
  url: string;
  authorization_token: string;

  private constructor({ API_URL: url, VERSION_HEADER: version_header, AUTHORIZATION_TOKEN: authorization_token }: DealpathConfig) {
    this.version_header = version_header;
    this.url = url;
    this.authorization_token = authorization_token;
  }

  static getClassName = () => 'DealpathAdapter';

  private get http(): AxiosInstance {
    const axiosInstance = axios.create({
      baseURL: this.url,
      headers: { Accept: this.version_header, Authorization: `Bearer ${this.authorization_token}` },
    });

    return axiosInstance;
  }

  async getProperties() {
    try {
      const properties: AxiosResponse<GetPropertiesResponse> = await this.http.get('/properties');

      return properties.data;
    } catch (error: any) {
      console.error(error);

      return false;
    }
  }

  async getProperty(id: string) {
    try {
      const property: AxiosResponse<GetPropertyResponse> = await this.http.get(`/property/${id}`);

      return property.data;
    } catch (error: any) {
      console.error(error);

      return false;
    }
  }
}
