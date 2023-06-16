import { ContainerInterface } from 'Container/Container';
import { WithdrawalsController } from 'Withdrawals/Port/Api/WithdrawalsController';

export type WithdrawalsApiType = {
  simulateWithdrawals: WithdrawalsController['simulateWithdrawals'];
  withdrawDividends: WithdrawalsController['withdrawDividends'];
};

export const WithdrawalsApi = (container: ContainerInterface): WithdrawalsApiType => ({
  simulateWithdrawals: container.delegateTo(WithdrawalsController, 'simulateWithdrawals'),
  withdrawDividends: container.delegateTo(WithdrawalsController, 'withdrawDividends'),
});
