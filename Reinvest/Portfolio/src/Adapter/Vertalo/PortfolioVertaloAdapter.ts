import { ExecutionVertaloAdapter } from 'Trading/Adapter/Vertalo/ExecutionVertaloAdapter';

export class PortfolioVertaloAdapter extends ExecutionVertaloAdapter {
  static getClassName = () => 'PortfolioVertaloAdapter';

  async getAssetName(allocationId: string): Promise<{ name: string }> {
    const query = `
            query {
              {
                allocationById(id:"${allocationId}"){
                  roundByRoundId{
                    assetByAssetId {
                      name
                    }
                  }
                }
              }
            }
        `;

    const {
      allocationById: {
        roundByRoundId: {
          assetByAssetId: { name },
        },
      },
    } = await this.sendRequest(query);

    return { name };
  }
}
