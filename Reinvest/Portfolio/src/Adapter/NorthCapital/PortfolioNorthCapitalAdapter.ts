import { ExecutionNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/ExecutionNorthCapitalAdapter';

export type NorthCapitalConfig = {
  API_URL: string;
  CLIENT_ID: string;
  DEVELOPER_API_KEY: string;
};

export type NorthCapitalOffering = {
  numberOfShares: number;
  offeringName: string;
  unitPrice: number;
};

export class PortfolioNorthCapitalAdapter extends ExecutionNorthCapitalAdapter {
  static getClassName = () => 'PortfolioNorthCapitalAdapter';

  async getOffering(offeringId: string): Promise<NorthCapitalOffering | null> {
    try {
      const endpoint = 'tapiv3/index.php/v3/getOffering';
      const data = {
        offeringId,
      };

      const response = await this.postRequest(endpoint, data);
      const {
        statusCode,
        statusDesc,
        offeringDetails: [details],
      } = response;

      return {
        offeringName: details.issueName,
        // @ts-ignore
        unitPrice: Math.round(parseFloat(details.unitPrice) * 100),
        numberOfShares: parseFloat(details.totalShares),
      };
    } catch (error: any) {
      console.error(`Cannot get offering ${offeringId}: ${error.message}`, error);

      return null;
    }
  }
}
