import { ExecutionVertaloAdapter } from 'Trading/Adapter/Vertalo/ExecutionVertaloAdapter';
import { VertaloDistributionState } from 'Trading/Domain/Trade';

export class TradingVertaloAdapter extends ExecutionVertaloAdapter {
  static getClassName = () => 'TradingVertaloAdapter';

  async createDistribution(allocationId: string, investorEmail: string, numberOfShares: string): Promise<VertaloDistributionState> {
    const mutationQuery = `
      mutation {
          makeDistribution (
            input: {
              _allocationId: "${allocationId}"
              amount: "${numberOfShares}"
              accountEmail: "${investorEmail}"
            }
          ) {
            distribution {
              id
              status
              createdOn
              amount
            }
          }
        }
        `;

    const {
      makeDistribution: {
        distribution: { id: distributionId, status, createdOn, amount },
      },
    } = await this.sendRequest(mutationQuery);

    return { distributionId, status, createdOn, amount };
  }
}
