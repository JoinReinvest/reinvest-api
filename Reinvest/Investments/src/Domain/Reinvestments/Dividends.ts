export enum DividendState {
  PENDING = 'PENDING',
  PAID_OUT = 'PAID_OUT',
  REINVESTED = 'REINVESTED',
}

export type DividendDetails = {
  amount: {
    formatted: string;
    value: number;
  };
  date: string;
  id: string;
  status: DividendState;
};
