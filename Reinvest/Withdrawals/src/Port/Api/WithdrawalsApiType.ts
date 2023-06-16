import { ContainerInterface } from 'Container/Container';
import { WithdrawalsController } from 'Withdrawals/Port/Api/SimulateWithdrawals';

export type WithdrawalsApiType = {
  createWithdrawalFundsRequest: WithdrawalsController['createWithdrawalFundsRequest'];
  getFundsWithdrawalRequest: WithdrawalsController['getFundsWithdrawalRequest'];
  simulateWithdrawals: WithdrawalsController['simulateWithdrawals'];
};

export const WithdrawalsApi = (container: ContainerInterface): WithdrawalsApiType => ({
  getFundsWithdrawalRequest: container.delegateTo(WithdrawalsController, 'getFundsWithdrawalRequest'),
  simulateWithdrawals: container.delegateTo(WithdrawalsController, 'simulateWithdrawals'),
  createWithdrawalFundsRequest: container.delegateTo(WithdrawalsController, 'createWithdrawalFundsRequest'),
});
