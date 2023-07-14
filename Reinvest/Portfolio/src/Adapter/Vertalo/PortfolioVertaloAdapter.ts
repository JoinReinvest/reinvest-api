import { ExecutionVertaloAdapter } from 'Trading/Adapter/Vertalo/ExecutionVertaloAdapter';

export class PortfolioVertaloAdapter extends ExecutionVertaloAdapter {
  static getClassName = () => 'PortfolioVertaloAdapter';

  async getAssetName(allocationId: string): Promise<string | null> {
    const query = `
            query {
              allocationById(id:"${allocationId}"){
                  roundByRoundId {
                    assetByAssetId {
                      name
                    }
                  }
                }
              }
        `;

    try {
      const result = await this.sendRequest(query);
      const {
        allocationById: {
          roundByRoundId: {
            assetByAssetId: { name },
          },
        },
      } = result;

      if (!name) {
        return null;
      }

      return name;
    } catch (error: any) {
      console.error(`Cannot get asset name for allocation ${allocationId}: ${error.message}`, error);

      return null;
    }
  }
}
