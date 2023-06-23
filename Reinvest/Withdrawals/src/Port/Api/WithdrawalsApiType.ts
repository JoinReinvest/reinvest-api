import { ContainerInterface } from 'Container/Container';
import { WithdrawalsAgreementController } from 'Withdrawals/Port/Api/WithdrawalsAgreementController';
import { WithdrawalsController } from 'Withdrawals/Port/Api/WithdrawalsController';

export type WithdrawalsApiType = {
  abortFundsWithdrawalRequest: WithdrawalsController['abortFundsWithdrawalRequest'];
  createFundsWithdrawalAgreement: WithdrawalsAgreementController['createFundsWithdrawalAgreement'];
  createWithdrawalFundsRequest: WithdrawalsController['createWithdrawalFundsRequest'];
  getFundsWithdrawalAgreement: WithdrawalsAgreementController['getFundsWithdrawalAgreement'];
  getFundsWithdrawalRequest: WithdrawalsController['getFundsWithdrawalRequest'];
  requestFundWithdrawal: WithdrawalsController['requestFundWithdrawal'];
  signFundsWithdrawalAgreement: WithdrawalsAgreementController['signFundsWithdrawalAgreement'];
  simulateWithdrawals: WithdrawalsController['simulateWithdrawals'];
  withdrawDividends: WithdrawalsController['withdrawDividends'];
};

export const WithdrawalsApi = (container: ContainerInterface): WithdrawalsApiType => ({
  getFundsWithdrawalAgreement: container.delegateTo(WithdrawalsAgreementController, 'getFundsWithdrawalAgreement'),
  createFundsWithdrawalAgreement: container.delegateTo(WithdrawalsAgreementController, 'createFundsWithdrawalAgreement'),
  signFundsWithdrawalAgreement: container.delegateTo(WithdrawalsAgreementController, 'signFundsWithdrawalAgreement'),
  getFundsWithdrawalRequest: container.delegateTo(WithdrawalsController, 'getFundsWithdrawalRequest'),
  simulateWithdrawals: container.delegateTo(WithdrawalsController, 'simulateWithdrawals'),
  createWithdrawalFundsRequest: container.delegateTo(WithdrawalsController, 'createWithdrawalFundsRequest'),
  withdrawDividends: container.delegateTo(WithdrawalsController, 'withdrawDividends'),
  abortFundsWithdrawalRequest: container.delegateTo(WithdrawalsController, 'abortFundsWithdrawalRequest'),
  requestFundWithdrawal: container.delegateTo(WithdrawalsController, 'requestFundWithdrawal'),
});
