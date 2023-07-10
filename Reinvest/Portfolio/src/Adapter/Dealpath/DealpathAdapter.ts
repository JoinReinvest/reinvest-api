import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { UUID } from 'HKEKTypes/Generics';
import { Property } from 'Portfolio/Domain/Property';
import { PropertyStatus } from 'Portfolio/Domain/types';

import { GetPropertiesResponse, GetPropertyResponse } from './types';
import { DateTime } from 'Money/DateTime';

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

  async getProperties(portfolioId: UUID): Promise<Property[] | null> {
    try {
      const propertiesResponse: AxiosResponse<GetPropertiesResponse> = await this.http.get('/properties');

      const data = propertiesResponse?.data?.properties?.data;

      if (data) {
        const properties = data.map(property => {
          const { id, address, name, location } = property;
          const dealpathJson = {
            id,
            address,
            name,
            location,
          };

          return Property.create({ id, portfolioId, status: PropertyStatus.ACTIVE, lastUpdate: DateTime.now().toDate(), dealpathJson });
        });

        return properties;
      }

      return [];
    } catch (error: any) {
      console.error(error);

      return null;
    }
  }

  async getProperty(id: string, portfolioId: UUID): Promise<Property | null> {
    try {
      const propertyResponse: AxiosResponse<GetPropertyResponse> = await this.http.get(`/property/${id}`);

      const data = propertyResponse?.data?.property?.data;

      if (data) {
        const { id, address, name, location } = data;
        const dealpathJson = {
          id,
          address,
          name,
          location,
        };

        return Property.create({ id, portfolioId, status: PropertyStatus.ACTIVE, lastUpdate: DateTime.now().toDate(), dealpathJson });
      }

      return null;
    } catch (error: any) {
      console.error(error);

      return null;
    }
  }
}
