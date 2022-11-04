import axios, {AxiosResponse} from "axios";
import VertaloException from "./VertaloException";

type roles = 'empty' | 'initial' | 'account_admin'
export default class VertaloRequester {
    clientId: string;
    clientSecret: string;
    authorizationToken: { token: string, role: roles };
    roles: any;
    tokenValidBefore: Date | null;
    url: string;

    constructor(clientId: string, clientSecret: string, url: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.url = url
        this.roles = {}
        this.authorizationToken = {token: '', role: 'empty'};
        this.tokenValidBefore = null
    }

    private async getToken(): Promise<string> {
        if (this.authorizationToken.role === 'empty' || <Date>this.tokenValidBefore < new Date()) {
            const {token: {access_token}, roles: {data: roles}} = await this.authorize()
            this.roles = roles.reduce((tempRoles: any, role: any) => {
                tempRoles[role.user_role] = role;
                return tempRoles;
            }, {});

            this.setToken(access_token, 'initial');
        }

        return this.authorizationToken.token;
    }

    private setToken(token: string, role: roles): void {
        this.authorizationToken = {token, role};
        this.tokenValidBefore = new Date(new Date().getTime() + (60 * 60000));
    }

    private clearToken(): void {
        this.authorizationToken = {token: '', role: 'empty'};
        this.tokenValidBefore = null
    }

    private async authorize(): Promise<any> {
        try {
            const response: AxiosResponse = await axios
                .get(`${this.url}/authenticate/token/login?client_id=${this.clientId}&client_secret=${this.clientSecret}`);
            return response.data;
        } catch (error: any) {
            throw new VertaloException(error.message, {status: error.response.status});
        }
    }

    private async authorizeAsAccountAdmin(): Promise<any> {
        if (this.authorizationToken.role === 'account_admin') {
            return;
        } else if (this.authorizationToken.role !== 'initial') {
            this.clearToken();
            await this.preAuthorize();
        }

        const {account_admin: {users_account_id: userAccountId}} = this.roles;

        const {access_token} = await this.authorizeByRole(userAccountId);
        this.setToken(access_token, 'account_admin');

    }

    private async authorizeByRole(userAccountId: string): Promise<any> {
        try {
            const token = await this.getToken();
            const response: AxiosResponse = await axios
                .get(`${this.url}/authenticate/token/role/${userAccountId}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });

            return response.data.token;
        } catch (error: any) {
            throw new VertaloException(error.response.status, error.message);
        }
    }

    public async preAuthorize(): Promise<string> {
        return await this.getToken();
    }

    private async mutationRequest(mutationQuery: string): Promise<any> {
        await this.authorizeAsAccountAdmin();
        const token = await this.getToken()
        try {
            const response: AxiosResponse = await axios
                .post(`${this.url}/token/api/v2/graphql`,
                    {"query": mutationQuery},
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        }
                    });

            return response.data.data;
        } catch (error) {
            // @ts-ignore
            throw new Error(`Request error: ${error.message}`)
        }
    }

    public async createAsset(assetName: string, assetType: string, authorizedTotal: string, status: string): Promise<string> {
        const mutationQuery = `
            mutation {
              createAsset (
                input: {
                  asset: {
                    name: "${assetName}"
                    type: "${assetType}"
                    authorizedTotal: "${authorizedTotal}"
                    status: "${status}"
                  }
                }
              ) {
                asset {
                  id
                }
              }
            }
        `

        const {createAsset: {asset: {id}}} = await this.mutationRequest(mutationQuery);

        return id;
    }

    async createRound(assetId: string,
                      name: string,
                      opensOn: string,
                      closesOn: string,
                      total: string,
                      price: string,
                      status: string,
                      termsUrl: string
    ): Promise<string> {
        const mutationQuery = `
            mutation {
              makeRound (
                input: {
                  assetId: "${assetId}"
                  name: "${name}"
                  opensOn: "${opensOn}"
                  closesOn: "${closesOn}"
                  total: "${total}"
                  price: "${price}"
                  status: "${status}"
                  termsUrl: "${termsUrl}"
                }
              ) {
                round {
                  id
                }
              }
            }
        `

        const {makeRound: {round: {id}}} = await this.mutationRequest(mutationQuery);

        return id;
    }

    async createAllocation(roundId: string,
                           issuerId: string,
                           name: string,
                           opensOn: string,
                           closesOn: string
    ): Promise<string> {
        const mutationQuery = `
            mutation {
              createAllocation (
                input: {
                  allocation: {
                    issuerId: "${issuerId}",
                    roundId: "${roundId}",
                    name: "${name}",
                    opensOn: "${opensOn}",
                    closesOn: "${closesOn}"
                  }
                }
              ) {
                allocation {
                  id
                }
              }
            }
        `

        const {createAllocation: {allocation: {id}}} = await this.mutationRequest(mutationQuery);

        return id;
    }

    async createInvestor(name: string, email: string
    ): Promise<any> {
        const mutationQuery = `
            mutation {
              makeCustomer (
                input: {
                  name: "${name}",
                  _email: "${email}"
                }
              ) {
                customer {
                  id
                  investorId
                }
              }
            }
        `

        const {makeCustomer: {customer: {id: customerId, investorId}}} = await this.mutationRequest(mutationQuery);

        return {customerId, investorId};
    }

    async createAtsInvestor(name: string, email: string
    ): Promise<any> {
        const mutationQuery = `
            mutation {
              makeInvestor (
                input: {
                  name: "${name}"
                  email: "${email}"
                }
              ) {
              account {
                  id
                }
              }
            }
        `

        const {makeInvestor: {account: {id: investorId}}} = await this.mutationRequest(mutationQuery);

        return investorId;
    }

    async createDistribution(allocationId: string, investorEmail: string, sharesAmount: string
    ): Promise<any> {
        const mutationQuery = `
      mutation {
          makeDistribution (
            input: {
              _allocationId: "${allocationId}"
              amount: "${sharesAmount}"
              accountEmail: "${investorEmail}"
            }
          ) {
            distribution {
              id
              status
            }
          }
        }
        `

        const {
            makeDistribution: {
                distribution: {
                    id: distributionId,
                    status
                }
            }
        } = await this.mutationRequest(mutationQuery);

        return {distributionId, status};
    }

    async updateDistributionStatus(distributionId: string, statusToUpdate: "open" | "closed"
    ): Promise<boolean> {
        const mutationQuery = `
            mutation {
              updateDistributionById (
                input: {
                  id: "${distributionId}"
                  distributionPatch: {status: "${statusToUpdate}"}
                }
              ) {
                distribution {
                  id
                  status
                }
              }
            }
        `

        const {updateDistributionById: {distribution: {status}}} = await this.mutationRequest(mutationQuery);

        return status === statusToUpdate;
    }

    async markPayment(distributionId: string, paymentAmount: string
    ): Promise<any> {
        const mutationQuery = `
            mutation {
              createDistributionPayment(
                input: {
                  distributionPayment: {
                    distributionId: "${distributionId}"
                    amount: "${paymentAmount}"
                  }
                }
              ) {
                distributionPayment {
                  id
                  paidOn
                }
              }
            }
        `

        const {
            createDistributionPayment: {
                distributionPayment: {
                    id: paymentId,
                    paidOn
                }
            }
        } = await this.mutationRequest(mutationQuery);

        return {paymentId, paidOn};

    }

    async issueShares(distributionId: string): Promise<any> {
        const mutationQuery = `
            mutation {
              issueDistributions (
                input: {
                  distributionIds: [
                    "${distributionId}"
                  ]
                }
              ) {
                issuanceEvents {
                  holdingId
                }
              }
            }
        `

        const {
            issueDistributions: {
                issuanceEvents: [{
                    holdingId
                }]
            }
        } = await this.mutationRequest(mutationQuery);

        return holdingId;
    }
}