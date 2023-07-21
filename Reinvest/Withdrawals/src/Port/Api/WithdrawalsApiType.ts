import { ContainerInterface } from 'Container/Container';
import { WithdrawalsAgreementController } from 'Withdrawals/Port/Api/WithdrawalsAgreementController';
import { WithdrawalsController } from 'Withdrawals/Port/Api/WithdrawalsController';

export type WithdrawalsApiType = {
  abortFundsWithdrawalRequest: WithdrawalsController['abortFundsWithdrawalRequest'];
  acceptWithdrawalRequests: WithdrawalsController['acceptWithdrawalRequests'];
  createFundsWithdrawalAgreement: WithdrawalsAgreementController['createFundsWithdrawalAgreement'];
  createWithdrawalFundsRequest: WithdrawalsController['createWithdrawalFundsRequest'];
  getFundsWithdrawalAgreement: WithdrawalsAgreementController['getFundsWithdrawalAgreement'];
  getFundsWithdrawalRequest: WithdrawalsController['getFundsWithdrawalRequest'];
  listDividendsWithdrawalsRequests: WithdrawalsController['listDividendsWithdrawalsRequests'];
  listFundsWithdrawalsPendingRequests: WithdrawalsController['listFundsWithdrawalsPendingRequests'];
  listWithdrawalsDocuments: WithdrawalsController['listWithdrawalsDocuments'];
  markWithdrawalAsCompleted: WithdrawalsController['markWithdrawalAsCompleted'];
  prepareWithdrawalDocuments: WithdrawalsController['prepareWithdrawalDocuments'];
  pushWithdrawalDocuments: WithdrawalsController['pushWithdrawalDocuments'];
  rejectWithdrawalRequests: WithdrawalsController['rejectWithdrawalRequests'];
  requestFundWithdrawal: WithdrawalsController['requestFundWithdrawal'];
  signFundsWithdrawalAgreement: WithdrawalsAgreementController['signFundsWithdrawalAgreement'];
  simulateWithdrawals: WithdrawalsController['simulateWithdrawals'];
  withdrawDividends: WithdrawalsController['withdrawDividends'];
};

export const WithdrawalsApi = (container: ContainerInterface): WithdrawalsApiType => ({
  getFundsWithdrawalAgreement: container.delegateTo(WithdrawalsAgreementController, 'getFundsWithdrawalAgreement'),
  createFundsWithdrawalAgreement: container.delegateTo(WithdrawalsAgreementController, 'createFundsWithdrawalAgreement'),
  signFundsWithdrawalAgreement: container.delegateTo(WithdrawalsAgreementController, 'signFundsWithdrawalAgreement'),
  pushWithdrawalDocuments: container.delegateTo(WithdrawalsController, 'pushWithdrawalDocuments'),
  listWithdrawalsDocuments: container.delegateTo(WithdrawalsController, 'listWithdrawalsDocuments'),
  listDividendsWithdrawalsRequests: container.delegateTo(WithdrawalsController, 'listDividendsWithdrawalsRequests'),
  getFundsWithdrawalRequest: container.delegateTo(WithdrawalsController, 'getFundsWithdrawalRequest'),
  prepareWithdrawalDocuments: container.delegateTo(WithdrawalsController, 'prepareWithdrawalDocuments'),
  acceptWithdrawalRequests: container.delegateTo(WithdrawalsController, 'acceptWithdrawalRequests'),
  listFundsWithdrawalsPendingRequests: container.delegateTo(WithdrawalsController, 'listFundsWithdrawalsPendingRequests'),
  rejectWithdrawalRequests: container.delegateTo(WithdrawalsController, 'rejectWithdrawalRequests'),
  simulateWithdrawals: container.delegateTo(WithdrawalsController, 'simulateWithdrawals'),
  createWithdrawalFundsRequest: container.delegateTo(WithdrawalsController, 'createWithdrawalFundsRequest'),
  withdrawDividends: container.delegateTo(WithdrawalsController, 'withdrawDividends'),
  abortFundsWithdrawalRequest: container.delegateTo(WithdrawalsController, 'abortFundsWithdrawalRequest'),
  requestFundWithdrawal: container.delegateTo(WithdrawalsController, 'requestFundWithdrawal'),
  markWithdrawalAsCompleted: container.delegateTo(WithdrawalsController, 'markWithdrawalAsCompleted'),
});
