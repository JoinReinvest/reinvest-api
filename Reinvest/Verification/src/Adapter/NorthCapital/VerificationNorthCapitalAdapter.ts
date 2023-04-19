import { ExecutionNorthCapitalAdapter } from 'Registration/Adapter/NorthCapital/ExecutionNorthCapitalAdapter';

export type NorthCapitalConfig = {
  API_URL: string;
  CLIENT_ID: string;
  DEVELOPER_API_KEY: string;
};

export class VerificationNorthCapitalAdapter extends ExecutionNorthCapitalAdapter {
  static getClassName = () => 'VerificationNorthCapitalAdapter';
}
