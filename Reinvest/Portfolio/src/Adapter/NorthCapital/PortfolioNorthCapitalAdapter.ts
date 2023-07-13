import { ExecutionNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/ExecutionNorthCapitalAdapter';

export type NorthCapitalConfig = {
  API_URL: string;
  CLIENT_ID: string;
  DEVELOPER_API_KEY: string;
};

export class PortfolioNorthCapitalAdapter extends ExecutionNorthCapitalAdapter {
  static getClassName = () => 'PortfolioNorthCapitalAdapter';
}
