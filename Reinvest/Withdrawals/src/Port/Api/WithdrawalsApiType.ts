import { ContainerInterface } from 'Container/Container';
import { WithdrawalsController } from 'Withdrawals/Port/Api/SimulateWithdrawals';

export type WithdrawalsApiType = {
  simulateWithdrawals: WithdrawalsController['simulateWithdrawals'];
};

export const WithdrawalsApi = (container: ContainerInterface): WithdrawalsApiType => ({
  simulateWithdrawals: container.delegateTo(WithdrawalsController, 'simulateWithdrawals'),
});
