import axios, {AxiosResponse} from "axios";

export default class VertaloRequester {
    clientId: string;
    clientSecret: string;
    authorizationToken: string | null;
    tokenValidBefore: Date | null;
    url: string;

    constructor(clientId: string, clientSecret: string, url: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.url = url
        this.authorizationToken = null
        this.tokenValidBefore = null
    }

    private async getToken(): Promise<string> {
        if (this.authorizationToken === null || this.tokenValidBefore < new Date()) {
            this.authorizationToken = await this.authorize()
            this.tokenValidBefore = new Date(new Date().getTime() + (60 * 60000));
        }

        return this.authorizationToken;
    }

    private async authorize(): Promise<string> {
        const response: AxiosResponse = await axios
            .get(`${this.url}/token/login?client_id=${this.clientId}&client_secret=${this.clientSecret}`);

        return response.data.token;
    }

    public async preAuthorize() {
        await this.getToken();
    }

    private async mutationRequest(mutationQuery: string): Promise<any> {
        const token = await this.getToken()
        try {
            const response: AxiosResponse = await axios
                .post(`${this.url}/token/api/v2/graphql`,
                    {"query": mutationQuery},
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            // "Content-Type": "application/json; charset=utf-8",
                        }
                    });

            return response.data;
        } catch (error) {
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
                           name: string,
                           opensOn: string,
                           closesOn: string
    ): Promise<string> {
        const mutationQuery = `
            mutation {
              createAllocation (
                input: {
                  allocation: {
                    roundId: "${roundId}"
                    name: "${name}"
                    opensOn: "${opensOn}"
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
                  name: "${name}"
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
}