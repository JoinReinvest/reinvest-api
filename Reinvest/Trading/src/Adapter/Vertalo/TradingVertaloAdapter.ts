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

  async openDistribution(distributionId: string): Promise<boolean> {
    return this.updateDistributionState(distributionId, 'open');
  }

  async closeDistribution(distributionId: string): Promise<boolean> {
    return this.updateDistributionState(distributionId, 'closed');
  }

  async markPayment(distributionId: string, amount: string): Promise<{ paymentId: string }> {
    const mutationQuery = `
            mutation {
              createDistributionPayment(
                input: {
                  distributionPayment: {
                    distributionId: "${distributionId}"
                    amount: "${amount}"
                  }
                }
              ) {
                distributionPayment {
                  id
                  paidOn
                }
              }
            }
        `;

    const {
      createDistributionPayment: {
        distributionPayment: { id: paymentId, paidOn },
      },
    } = await this.sendRequest(mutationQuery);

    return { paymentId };
  }

  async issueShares(distributionId: string): Promise<{ holdingId: string }> {
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
        `;

    const {
      issueDistributions: {
        issuanceEvents: [{ holdingId }],
      },
    } = await this.sendRequest(mutationQuery);

    return { holdingId };
  }

  private async updateDistributionState(distributionId: string, statusToUpdate: 'open' | 'closed'): Promise<boolean> {
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
        `;

    const {
      updateDistributionById: {
        distribution: { status },
      },
    } = await this.sendRequest(mutationQuery);

    return status === statusToUpdate;
  }
}
