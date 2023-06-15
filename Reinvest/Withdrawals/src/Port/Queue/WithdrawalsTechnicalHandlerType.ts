import { ContainerInterface } from 'Container/Container';

export type WithdrawalsTechnicalHandlerType = {
  // CheckIsInvestmentApproved: CheckIsInvestmentApprovedHandler['handle'];
};

export const WithdrawalsTechnicalHandler = (container: ContainerInterface): WithdrawalsTechnicalHandlerType => ({
  // CheckIsInvestmentApproved: container.delegateTo(CheckIsInvestmentApprovedHandler, 'handle'),
});
