export enum DividendState {
  PENDING = 'PENDING',
  PAID_OUT = 'PAID_OUT',
  REINVESTED = 'REINVESTED',
  PAYING_OUT = 'PAYING_OUT',
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
