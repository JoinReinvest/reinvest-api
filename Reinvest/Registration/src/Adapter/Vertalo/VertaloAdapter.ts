import {ExecutionVertaloAdapter} from "Registration/Adapter/Vertalo/ExecutionVertaloAdapter";
import {InvestorVertaloIds} from "Registration/Domain/VendorModel/Vertalo/VertaloTypes";

export class VertaloAdapter extends ExecutionVertaloAdapter {
    static getClassName = () => 'VertaloAdapter';

    async createInvestor(name: string, email: string): Promise<InvestorVertaloIds | never> {
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

        const {makeCustomer: {customer: {id: customerId, investorId}}} = await this.sendRequest(mutationQuery);

        return {investorId, customerId};
    }

    async updateInvestor(investorIds: InvestorVertaloIds, name: string): Promise<void> {
        const {customerId, investorId} = investorIds;
        const mutationQuery = `
            mutation {
              updateCustomerById(input: {
                clientMutationId: "${investorId}",
                id: "${customerId}",
                customerPatch: {
                  name: "${name}"
                }
              }) {
                clientMutationId
                customer { status }
              }
            }
        `

        await this.sendRequest(mutationQuery);
    }

    async getAccount(customerId: string): Promise<object | never> {
        const query = `
            query {
              customerById (id: "${customerId}") {
                name
                status
                id
                formationDate
                investorType
              }
            }
        `

        const customer = await this.sendRequest(query);

        return customer;
    }
}
