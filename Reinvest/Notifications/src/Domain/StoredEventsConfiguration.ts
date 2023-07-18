import { DictionaryType } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { NotificationObjectType, NotificationsType } from 'Notifications/Domain/Notification';
import { StoredEventsType } from 'Notifications/Domain/StoredEventTypes';

export enum StoredEventKind {
  UserRegistered = 'UserRegistered',
  BeneficiaryAccountOpened = 'BeneficiaryAccountOpened',
  IndividualAccountOpened = 'IndividualAccountOpened',
  CorporateAccountOpened = 'CorporateAccountOpened',
  TrustAccountOpened = 'TrustAccountOpened',
  InvestmentProcessStarted = 'InvestmentProcessStarted',
  PaymentInitiated = 'PaymentInitiated',
  PaymentFinished = 'PaymentFinished',
  TransactionCanceled = 'TransactionCanceled',
  ArchivingBeneficiaryStarted = 'ArchivingBeneficiaryStarted',
  ArchivingBeneficiaryCompleted = 'ArchivingBeneficiaryCompleted',
  TransferringBeneficiaryToParentCompleted = 'TransferringBeneficiaryToParentCompleted',
  RecurringInvestmentSuspended = 'RecurringInvestmentSuspended',
  SharesIssued = 'SharesIssued',
  VerificationFailed = 'VerificationFailed',
  PaymentFailed = 'PaymentFailed',
  DividendReinvested = 'DividendReinvested',
  DividendWithdrawn = 'DividendWithdrawn',
  WithdrawalRequestRejected = 'WithdrawalRequestRejected',
  WithdrawalRequestApproved = 'WithdrawalRequestApproved',
  WithdrawalRequestSent = 'WithdrawalRequestSent',
}

export const StoredEvents = <StoredEventsType>{
  ArchivingBeneficiaryCompleted: {
    accountActivity: {
      data: ({ amountTransferred, numberOfShares, name, numberOfInvestments }) => ({
        amountTransferred,
        numberOfShares,
        name,
        numberOfInvestments,
      }),
      name: ({ numberOfShares }) => `Beneficiary archived. Transferred ${numberOfShares} shares to main account`,
    },
  },
  TransferringBeneficiaryToParentCompleted: {
    accountActivity: {
      data: ({ amountTransferred, numberOfShares, name, numberOfInvestments }) => ({
        amountTransferred,
        numberOfShares,
        name,
        numberOfInvestments,
      }),
      name: ({ numberOfShares, name }) => `Beneficiary "${name}" is archived. ${numberOfShares} shares were transferred`,
    },
  },
  UserRegistered: {
    accountActivity: {
      name: ({ userName }) => `${userName} joined our platform.`,
    },
    push: {
      title: ({ userName }) => `Welcome to our app, ${userName}!`,
      body: () => '',
    },

    inApp: {
      header: ({ userName }) => `Welcome, ${userName}!`,
      body: () => ` Let's get started with your investing journey.`,
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    email: {
      subject: () => 'Welcome to REINVEST Community!',
      body: ({ userName }) => `Dear ${userName}, welcome to our platform. Let's start your financial growth journey.`,
    },
    analyticEvent: {
      eventName: 'UserRegistered',
      sendIdentity: () => true,
      identityData: ({ userName }) => ({ userName }),
      data: data => data,
    },
  },
  CorporateAccountOpened: {
    inApp: {
      header: ({ userName }) => `${userName}`,
      body: () => `Your corporate account has been created successfully.`,
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    email: {
      subject: () => 'Account created',
      body: ({ userName }) => `Dear ${userName}, your corporate account has been created successfully.`,
    },
    accountActivity: {
      name: ({ userName }) => `Corporate account created for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'CorporateAccountOpened',
      data: data => data,
    },
  },
  TrustAccountOpened: {
    inApp: {
      header: ({ userName }) => `${userName}`,
      body: () => `Your trust account has been created successfully.`,
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    email: {
      subject: () => 'Account created',
      body: ({ userName }) => `Dear ${userName}, your trust account has been created successfully.`,
    },
    accountActivity: {
      name: ({ userName }) => `Trust account created for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'TrustAccountOpened',
      data: data => data,
    },
  },
  IndividualAccountOpened: {
    inApp: {
      header: ({ userName }) => `${userName}`,
      body: () => `Your individual account has been created successfully.`,
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    email: {
      subject: () => 'Account created',
      body: ({ userName }) => `Dear ${userName}, your individual account has been created successfully.`,
    },
    accountActivity: {
      name: ({ userName }) => `Individual account created for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'IndividualAccountOpened',
      data: data => data,
    },
  },
  BeneficiaryAccountOpened: {
    inApp: {
      header: ({ userName }) => `${userName}`,
      body: () => `Your beneficiary account has been created successfully.`,
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    email: {
      subject: ({ label }) => `Beneficiary ${label} added`,
      body: ({ userName, label }) => `Dear ${userName}, your beneficiary account for ${label} has been created successfully.`,
    },
    accountActivity: {
      name: ({ userName }) => `Beneficiary account created for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'BeneficiaryAccountOpened',
      data: data => data,
    },
  },
  InvestmentProcessStarted: {
    accountActivity: {
      data: ({ amount, tradeId, origin, investmentId }) => ({
        amount,
        tradeId,
        origin,
        investmentId,
      }),
      name: investmentStartedBody,
    },
    push: {
      title: () => 'Investment started',
      body: investmentStartedBody,
    },
  },
  ArchivingBeneficiaryStarted: {
    accountActivity: {
      data: ({ label, beneficiaryId, accountId }) => ({
        label,
        beneficiaryId,
        accountId,
      }),
      name: ({ label }) => `Beneficiary ${label} is being archived`,
    },
    push: {
      title: () => 'Archiving beneficiary started',
      body: ({ label }) => `Beneficiary ${label} is being archived`,
    },
    inApp: {
      header: () => 'Archiving beneficiary started',
      body: ({ label }) => `Beneficiary ${label} is being archived`,
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
      onObject: ({ beneficiaryId }) => ({
        onObjectId: beneficiaryId,
        onObjectType: NotificationObjectType.ACCOUNT,
      }),
    },
  },
  PaymentInitiated: {
    inApp: {
      header: ({ userName }) => `Your payment has been initiated, ${userName}.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
      onObject: ({ investmentId }) => ({
        onObjectId: investmentId,
        onObjectType: NotificationObjectType.INVESTMENT,
      }),
    },
    push: {
      title: () => `Payment initiated!`,
      body: ({ tradeId }) => `Your recent investment ${tradeId} has started successfully`,
    },
    email: {
      subject: () => 'Payment started',
      body: ({ userName, tradeId, amount, date }) =>
        `Dear ${userName}, your payment of ${Money.lowPrecision(amount).getFormattedAmount()} has been initiated successfully.<br/>${transactionAndTimeBody(
          tradeId,
          date,
        )}`,
    },
    accountActivity: {
      name: ({ userName }) => `Payment initiated for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'PaymentInitiated',
      data: data => data,
    },
  },
  PaymentFinished: {
    inApp: {
      header: ({ userName }) => `${userName}, your payment has been processed successfully.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
      onObject: ({ investmentId }) => ({
        onObjectId: investmentId,
        onObjectType: NotificationObjectType.INVESTMENT,
      }),
    },
    push: {
      title: () => `Payment processed!`,
      body: ({ tradeId }) => `Your recent investment ${tradeId}has completed successfully`,
    },
    email: {
      subject: () => 'Payment successful',
      body: ({ userName, tradeId, amount, date }) =>
        `Dear ${userName}, your payment of ${Money.lowPrecision(amount).getFormattedAmount()} has been processed successfully.<br>${transactionAndTimeBody(
          tradeId,
          date,
        )}`,
    },
    accountActivity: {
      name: ({ userName }) => `Payment processed for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'PaymentFinished',
      data: data => data,
    },
  },
  TransactionCanceled: {
    inApp: {
      header: ({ userName }) => `Your recent transaction has been canceled, ${userName}.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
      onObject: ({ investmentId }) => ({
        onObjectId: investmentId,
        onObjectType: NotificationObjectType.INVESTMENT,
      }),
    },
    push: {
      title: () => `Transaction canceled.`,
      body: ({ tradeId }) => `Your recent investment ${tradeId} transaction is canceled`,
    },
    email: {
      subject: () => 'Transaction Canceled',
      body: ({ userName, amount, tradeId, date }) => `Dear ${userName}, your recent transaction of ${Money.lowPrecision(
        amount,
      ).getFormattedAmount()} has been canceled.<br/>${transactionAndTimeBody(tradeId, date)}
      `,
    },
    accountActivity: {
      name: ({ userName }) => `Transaction canceled for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'TransactionCanceled',
      data: data => data,
    },
  },
  RecurringInvestmentSuspended: {
    accountActivity: {
      data: ({ recurringId, reason }) => ({
        recurringId,
        reason,
      }),
      name: ({ reason }) => `Recurring investment suspended. Reason: ${reason}`,
    },
    inApp: {
      header: () => `Recurring investment suspended.`,
      body: ({ reason }) => `${reason}`,
      notificationType: NotificationsType.RECURRING_INVESTMENT_FAILED,
      onObject: ({ recurringId }) => ({
        onObjectId: recurringId,
        onObjectType: NotificationObjectType.RECURRING_INVESTMENT,
      }),
    },
    push: {
      title: () => `Recurring investment suspended.`,
      body: ({ reason }) => `${reason}`,
    },
  },
  SharesIssued: {
    inApp: {
      header: ({ userName }) => `${userName}, your shares have been issued successfully.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
      onObject: ({ investmentId }) => ({
        onObjectId: investmentId,
        onObjectType: NotificationObjectType.INVESTMENT,
      }),
    },
    push: {
      title: () => `Shares issued!`,
      body: ({ tradeId }) => 'Your recent investment ${tradeId} shares have been issued',
    },
    email: {
      subject: () => 'Shares transferred',
      body: ({
        userName,
        numberOfShares,
        tradeId,
        date,
      }) => `Dear ${userName}, you have been successfully issued ${numberOfShares}.<br/>${transactionAndTimeBody(tradeId, date)}
      `,
    },
    accountActivity: {
      name: ({ userName }) => `Shares issued for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'SharesIssued',
      data: data => data,
    },
  },
  VerificationFailed: {
    inApp: {
      header: ({ userName }) => `${userName}`,
      body: () => 'Please update your data.',
      notificationType: NotificationsType.VERIFICATION_FAILED,
      onObject: ({ accountId }) => ({
        onObjectId: accountId,
        onObjectType: NotificationObjectType.ACCOUNT,
      }),
    },
    push: {
      title: () => `Data update required.`,
      body: () => 'Accurate information is required to continue',
    },
    email: {
      subject: () => 'Information needed',
      body: ({ userName }) => `Dear ${userName}, to continue seamless services, please update your data.`,
    },
    analyticEvent: {
      eventName: 'VerificationFailed',
      data: data => data,
    },
  },
  PaymentFailed: {
    inApp: {
      header: ({ userName }) => `${userName}, your funds transfer has failed.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
      onObject: ({ investmentId }) => ({
        onObjectId: investmentId,
        onObjectType: NotificationObjectType.INVESTMENT,
      }),
    },
    push: {
      title: () => `Funds transfer failed.`,
      body: ({ tradeId }) => `Your recent investment ${tradeId} funds transfer failed`,
    },
    email: {
      subject: () => 'Transfer failed',
      body: ({ userName, amount, tradeId, date }) => `Dear ${userName}, your funds transfer of ${Money.lowPrecision(
        amount,
      ).getFormattedAmount()} has failed.<br/>${transactionAndTimeBody(tradeId, date)}
      `,
    },
    accountActivity: {
      name: ({ userName }) => `Funds transfer failed for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'PaymentFailed',
      data: data => data,
    },
  },
  DividendReinvested: {
    inApp: {
      header: ({ userName }) => `${userName}, your dividends have been reinvested.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    email: {
      subject: () => 'Dividend Reinvested',
      body: ({ userName, amount, date }) => `Dear ${userName}, your dividends ${Money.lowPrecision(
        amount,
      ).getFormattedAmount()} have been successfully reinvested.<br/>${timeBody(date)}
      `,
    },
    accountActivity: {
      name: ({ userName }) => `Dividends reinvested for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'DividendReinvested',
      data: data => data,
    },
  },
  DividendWithdrawn: {
    inApp: {
      header: ({ userName }) => `${userName}, your dividends have been successfully withdrawn.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    email: {
      subject: () => 'Dividend Withdrawn',
      body: ({ userName, amount, date }) => `Dear ${userName}, your dividends ${Money.lowPrecision(
        amount,
      ).getFormattedAmount()} have been successfully withdrawn to your linked account..<br/>${timeBody(date)}
      `,
    },
    accountActivity: {
      name: ({ userName }) => `Dividends withdrawn for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'DividendWithdrawn',
      data: data => data,
    },
  },
  WithdrawalRequestRejected: {
    inApp: {
      header: ({ userName }) => `Sorry ${userName}, your withdrawal request has been rejected.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    push: {
      title: () => `Withdrawal request rejected.`,
      body: () => ``,
    },
    email: {
      subject: () => 'Funds Withdrawal request status',
      body: ({ userName, amount }) => `Dear ${userName}, unfortunately, your withdrawal request for ${Money.lowPrecision(
        amount,
      ).getFormattedAmount()} has been rejected. Please contact support for further assistance.
      `,
    },
    accountActivity: {
      name: ({ userName }) => `Withdrawal request rejected for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'WithdrawalRequestRejected',
      data: data => data,
    },
  },
  WithdrawalRequestApproved: {
    inApp: {
      header: ({ userName }) => `${userName}, your withdrawal request has been approved.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    push: {
      title: () => `Withdrawal request approved.`,
      body: () => ``,
    },
    email: {
      subject: () => 'Withdrawal Approved!',
      body: ({ userName }) => `Dear ${userName}, unfortunately, your withdrawal request has been approved. The funds will be transferred shortly.`,
    },
    accountActivity: {
      name: ({ userName }) => `Withdrawal request approved for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'WithdrawalRequestApproved',
      data: data => data,
    },
  },
  WithdrawalRequestSent: {
    analyticEvent: {
      eventName: 'WithdrawalRequestSent',
      data: data => data,
    },
  },
};

function investmentStartedBody({ amount, tradeId }: DictionaryType): string {
  const castedAmount = parseInt(amount);
  const formattedAmount = Money.lowPrecision(castedAmount).getFormattedAmount();

  return `Trade ${tradeId} started with amount ${formattedAmount}`;
}

function transactionAndTimeBody(tradeId: string, date: string): string {
  return `Transaction ID: ${tradeId}<br/>${timeBody(date)}`;
}

function timeBody(date: string): string {
  return `Time: ${DateTime.from(date).toFormattedDate('HH:mm:ss')}<br/>
      Date: ${DateTime.from(date).toFormattedDate('MM/DD/YYYY')}`;
}
