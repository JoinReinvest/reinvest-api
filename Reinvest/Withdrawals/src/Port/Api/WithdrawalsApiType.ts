import { ContainerInterface } from 'Container/Container';

export type WithdrawalsApiType = {
  // canObjectBeUpdated: UserWithdrawalsActions['canObjectBeUpdated'];
};

export const WithdrawalsApi = (container: ContainerInterface): WithdrawalsApiType => ({
  // canObjectBeUpdated: container.delegateTo(UserWithdrawalsActions, 'canObjectBeUpdated'),
});
