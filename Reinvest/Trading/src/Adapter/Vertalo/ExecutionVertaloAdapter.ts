import axios, { AxiosResponse } from 'axios';
import { DateTime } from 'Money/DateTime';
import VertaloException from 'test/characterization/Vertalo/VertaloException';

export type VertaloConfig = {
  API_URL: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
};

type Roles = 'empty' | 'initial' | 'account_admin';

export abstract class ExecutionVertaloAdapter {
  clientId: string;
  clientSecret: string;
  authorizationToken: { role: Roles; token: string };
  roles: any;
  tokenValidBefore: Date | null;
  url: string;

  constructor({ CLIENT_ID: clientId, CLIENT_SECRET: clientSecret, API_URL: url }: VertaloConfig) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.url = url;
    this.roles = {};
    this.authorizationToken = { token: '', role: 'empty' };
    this.tokenValidBefore = null;
  }

  protected async preAuthorize(): Promise<string> {
    return await this.getToken();
  }

  protected async sendRequest(query: string): Promise<any> {
    await this.authorizeAsAccountAdmin();
    const token = await this.getToken();
    try {
      const response: AxiosResponse = await axios.post(
        `${this.url}/token/api/v2/graphql`,
        { query: query },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.data;
    } catch (error) {
      // @ts-ignore
      throw new Error(`Request error: ${error.message}`);
    }
  }

  private async getToken(): Promise<string> {
    if (this.authorizationToken.role === 'empty' || <Date>this.tokenValidBefore < DateTime.now().toDate()) {
      const {
        token: { access_token },
        roles: { data: roles },
      } = await this.authorize();
      this.roles = roles.reduce((tempRoles: any, role: any) => {
        tempRoles[role.user_role] = role;

        return tempRoles;
      }, {});

      this.setToken(access_token, 'initial');
    }

    return this.authorizationToken.token;
  }

  private setToken(token: string, role: Roles): void {
    this.authorizationToken = { token, role };
    this.tokenValidBefore = DateTime.now()
      .addSeconds(60 * 60000)
      .toDate();
  }

  private clearToken(): void {
    this.authorizationToken = { token: '', role: 'empty' };
    this.tokenValidBefore = null;
  }

  private async authorize(): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(`${this.url}/authenticate/token/login?client_id=${this.clientId}&client_secret=${this.clientSecret}`);

      return response.data;
    } catch (error: any) {
      throw new VertaloException(error.message, { status: error.response.status });
    }
  }

  private async authorizeAsAccountAdmin(): Promise<any> {
    if (this.authorizationToken.role === 'account_admin') {
      return;
    } else if (this.authorizationToken.role !== 'initial') {
      this.clearToken();
      await this.preAuthorize();
    }

    const {
      account_admin: { users_account_id: userAccountId },
    } = this.roles;

    const { access_token } = await this.authorizeByRole(userAccountId);
    this.setToken(access_token, 'account_admin');
  }

  private async authorizeByRole(userAccountId: string): Promise<any> {
    try {
      const token = await this.getToken();
      const response: AxiosResponse = await axios.get(`${this.url}/authenticate/token/role/${userAccountId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.token;
    } catch (error: any) {
      throw new VertaloException(error.response.status, error.message);
    }
  }
}
