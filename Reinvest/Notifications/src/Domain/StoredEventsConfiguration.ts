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
  RecurringInvestmentProcessStarted = 'RecurringInvestmentProcessStarted',
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
  ProfileCompleted = 'ProfileCompleted',
  InvestmentCompleted = 'InvestmentCompleted',
  InvestmentFailed = 'InvestmentFailed',
  RecurringInvestmentCreated = 'RecurringInvestmentCreated',
  RecurringInvestmentDeactivated = 'RecurringInvestmentDeactivated',
  ReferralRewardReceived = 'ReferralRewardReceived',
  DividendReceived = 'DividendReceived',
  AccountUpdated = 'AccountUpdated',
  AccountBanned = 'AccountBanned',
  AccountUnbanned = 'AccountUnbanned',
  ProfileBanned = 'ProfileBanned',
  ProfileUnbanned = 'ProfileUnbanned',
  EmailUpdated = 'EmailUpdated',
  FeesApprovalRequired = 'FeesApprovalRequired',
}

export const StoredEvents = <StoredEventsType>{
  TransferringBeneficiaryToParentCompleted: {
    inApp: {
      header: ({ userName }) => `${userName}, the transfer of your beneficiary has been completed.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
      onObject: ({ accountId }) => ({
        onObjectId: accountId,
        onObjectType: NotificationObjectType.ACCOUNT,
      }),
    },
    push: {
      title: () => `Beneficiary transferred.`,
      body: () => '',
    },
    accountActivity: {
      name: ({ userName }) => `Beneficiary transferred for ${userName}`,
    },
    analyticEvent: {
      eventName: 'TransferringBeneficiaryToParentCompleted',
      data: data => data,
    },
  },
  UserRegistered: {
    inApp: {
      header: ({ userName }) => `Welcome, ${userName}!`,
      body: () => ` Let's get started with your investing journey.`,
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    push: {
      title: ({ userName }) => `Welcome to our app, ${userName}!`,
      body: () => '',
    },
    email: {
      subject: () => 'Welcome to REINVEST Community!',
      body: ({ userName }) => `Dear ${userName}, welcome to our platform. Let's start your financial growth journey.`,
    },
    accountActivity: {
      name: ({ userName }) => `${userName} joined our platform.`,
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
    inApp: {
      header: ({ userName }) => `${userName}`,
      body: () => `Your investment process has been started.`,
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    push: {
      title: () => 'Investment process started.',
      body: () => '',
    },
    email: {
      subject: () => `Investment Initiated`,
      body: ({ userName }) => `Dear ${userName}, your investment process has been initiated. We will keep you updated on the progress.`,
    },
    accountActivity: {
      data: ({ amount, tradeId, origin, investmentId }) => ({
        amount,
        tradeId,
        origin,
        investmentId,
      }),
      name: ({ userName }) => `Investment process started for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'InvestmentProcessStarted',
      data: data => data,
    },
  },
  ArchivingBeneficiaryStarted: {
    inApp: {
      header: ({ userName }) => `${userName}, the process of archiving your beneficiary has started.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
      onObject: ({ beneficiaryId }) => ({
        onObjectId: beneficiaryId,
        onObjectType: NotificationObjectType.ACCOUNT,
      }),
    },
    push: {
      title: () => 'Archiving beneficiary started.',
      body: () => ``,
    },
    accountActivity: {
      name: ({ userName }) => `Archiving of beneficiary started for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'ArchivingBeneficiaryStarted',
      data: data => data,
    },
  },
  ArchivingBeneficiaryCompleted: {
    accountActivity: {
      name: ({ userName }) => `Beneficiary archived for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'ArchivingBeneficiaryCompleted',
      data: data => data,
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
      body: ({ userName, amount }) =>
        `Dear ${userName}, unfortunately, your withdrawal request for ${amount} has been rejected. Please contact support for further assistance.`,
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
      body: ({ userName }) => `Dear ${userName}, your withdrawal request has been approved. The funds will be transferred shortly.`,
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
  ProfileCompleted: {
    inApp: {
      header: ({ userName }) => `${userName}`,
      body: () => `Your profile has been created successfully.`,
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    email: {
      subject: () => `Profile Created`,
      body: ({ label }) => `Dear ${label}, your profile has been created successfully.`,
    },
    accountActivity: {
      name: ({ label }) => `${label}'s profile was created.`,
    },
    analyticEvent: {
      eventName: 'ProfileCompleted',
      sendIdentity: () => true,
      identityData: data => data,
      data: data => data,
    },
  },
  InvestmentCompleted: {
    inApp: {
      header: ({ userName }) => `${userName}`,
      body: () => `Your investment process was successful.`,
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    push: {
      title: () => 'Investment process successful.',
      body: () => '',
    },
    email: {
      subject: () => `Investment Successful`,
      body: ({ userName }) => `Dear ${userName}, we are happy to inform you that your investment process was successful.`,
    },
    accountActivity: {
      data: ({ amount, tradeId, origin, investmentId }) => ({
        amount,
        tradeId,
        origin,
        investmentId,
      }),
      name: ({ userName }) => `Investment process was successful for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'InvestmentCompleted',
      data: data => data,
    },
  },
  InvestmentFailed: {
    inApp: {
      header: ({ userName }) => `${userName}`,
      body: () => `Your recent investment process has failed. Please try again.`,
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    push: {
      title: () => 'Investment process failed.',
      body: () => '',
    },
    email: {
      subject: () => `Investment process failure`,
      body: ({ userName }) =>
        `Dear ${userName}, we're sorry to inform you that your recent investment process failed. Please try again or contact support if the problem persists.`,
    },
    accountActivity: {
      data: ({ amount, tradeId, origin, investmentId }) => ({
        amount,
        tradeId,
        origin,
        investmentId,
      }),
      name: ({ userName }) => `Investment process failed for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'InvestmentFailed',
      data: data => data,
    },
  },
  RecurringInvestmentProcessStarted: {
    inApp: {
      header: ({ userName }) => `${userName}`,
      body: () => `The scheduled investment process has started.`,
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    email: {
      subject: () => `Scheduled investment started`,
      body: ({ userName }) => `Dear ${userName} the scheduled investment process has started. We'll notify you once it's complete.`,
    },
    accountActivity: {
      data: ({ amount, tradeId, origin, investmentId }) => ({
        amount,
        tradeId,
        origin,
        investmentId,
      }),
      name: ({ userName }) => `Scheduled investment process started for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'RecurringInvestmentProcessStarted',
      data: data => data,
    },
  },
  RecurringInvestmentCreated: {
    inApp: {
      header: ({ userName }) => `${userName}, your recurring investment schedule has been created.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    email: {
      subject: () => `Recurring Investment scheduled`,
      body: ({ userName }) => `Dear ${userName}, your recurring investment schedule has been created successfully.`,
    },
    accountActivity: {
      name: ({ userName }) => `Recurring investment schedule created for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'RecurringInvestmentCreated',
      data: data => data,
    },
  },
  RecurringInvestmentDeactivated: {
    inApp: {
      header: ({ userName }) => `${userName}, your recurring investment schedule has been canceled.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    email: {
      subject: () => `Recurring investment schedule canceled`,
      body: ({ userName }) => `Dear ${userName}, your recurring investment schedule has been canceled.`,
    },
    accountActivity: {
      name: ({ userName }) => `Recurring investment schedule canceled for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'RecurringInvestmentDeactivated',
      data: data => data,
    },
  },
  RecurringInvestmentSuspended: {
    inApp: {
      header: ({ userName }) => `${userName}, your recurring investment schedule has been suspended.`,
      body: () => '',
      notificationType: NotificationsType.RECURRING_INVESTMENT_FAILED,
      onObject: ({ recurringId }) => ({
        onObjectId: recurringId,
        onObjectType: NotificationObjectType.RECURRING_INVESTMENT,
      }),
    },
    push: {
      title: () => `Investment schedule suspended.`,
      body: () => '',
    },
    email: {
      subject: () => `Recurring investment suspended`,
      body: ({ userName }) => `Dear ${userName}, your recurring investment schedule has been temporarily suspended.`,
    },
    accountActivity: {
      name: () => 'Recurring investment schedule suspended',
    },
    analyticEvent: {
      eventName: 'RecurringInvestmentSuspended',
      data: data => data,
    },
  },
  ReferralRewardReceived: {
    inApp: {
      header: ({ userName }) => `Congratulations ${userName}`,
      body: () => "You've received a referral reward!",
      notificationType: NotificationsType.REWARD_DIVIDEND_RECEIVED,
      onObject: ({ rewardId }) => ({
        onObjectId: rewardId,
        onObjectType: NotificationObjectType.DIVIDEND,
      }),
    },
    push: {
      title: () => `Referral reward received!`,
      body: () => '',
    },
    accountActivity: {
      name: ({ userName }) => `Referral reward received by ${userName}.`,
    },
    analyticEvent: {
      eventName: 'ReferralRewardReceived',
      data: data => data,
    },
  },
  DividendReceived: {
    inApp: {
      header: ({ userName }) => `${userName}, your dividends have been updated. Please check your account.`,
      body: () => '',
      notificationType: NotificationsType.DIVIDEND_RECEIVED,
      onObject: ({ dividendId }) => ({
        onObjectId: dividendId,
        onObjectType: NotificationObjectType.DIVIDEND,
      }),
    },
    push: {
      title: () => `Dividends updated.`,
      body: () => '',
    },
    email: {
      subject: () => `Dividends update`,
      body: ({ userName }) => `Dear ${userName}, your dividends have been updated. Please log in to your account for more details.`,
    },
    accountActivity: {
      name: ({ userName }) => `Dividends updated for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'DividendReceived',
      data: data => data,
    },
  },
  AccountUpdated: {
    inApp: {
      header: ({ userName }) => `${userName}, your account has been updated successfully.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
      onObject: ({ accountId }) => ({
        onObjectId: accountId,
        onObjectType: NotificationObjectType.ACCOUNT,
      }),
    },
    email: {
      subject: () => `Account updated`,
      body: ({ userName }) => `Dear ${userName}, your account has been updated successfully.`,
    },
    accountActivity: {
      name: ({ userName }) => `${userName}'s account was updated.`,
    },
    analyticEvent: {
      eventName: 'AccountUpdated',
      data: data => data,
    },
  },
  AccountBanned: {
    inApp: {
      header: ({ userName }) => `${userName}, your account has been banned due to policy violation.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
      onObject: ({ accountId }) => ({
        onObjectId: accountId,
        onObjectType: NotificationObjectType.ACCOUNT,
      }),
    },
    email: {
      subject: () => `Account banned`,
      body: ({ userName }) => `Dear ${userName}, your account has been banned due to a policy violation. Please contact support for more information.`,
    },
    accountActivity: {
      name: ({ userName }) => `Account banned for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'AccountBanned',
      data: data => data,
    },
  },
  ProfileBanned: {
    inApp: {
      header: ({ userName }) => `${userName}, your profile has been banned due to policy violation.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    email: {
      subject: () => `Profile banned`,
      body: ({ userName }) => `Dear ${userName}, your profile has been banned due to a policy violation. Please contact support for more information.`,
    },
    accountActivity: {
      name: ({ userName }) => `Profile banned for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'ProfileBanned',
      data: data => data,
    },
  },
  AccountUnbanned: {
    inApp: {
      header: ({ userName }) => `${userName}, your account has been unbanned. Please adhere to our policies.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
      onObject: ({ accountId }) => ({
        onObjectId: accountId,
        onObjectType: NotificationObjectType.ACCOUNT,
      }),
    },
    email: {
      subject: () => `Account unbanned`,
      body: ({ userName }) => `Dear ${userName}, your account has been unbanned. Please ensure you adhere to our policies going forward.`,
    },
    accountActivity: {
      name: ({ userName }) => `Account unbanned for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'AccountUnbanned',
      data: data => data,
    },
  },
  ProfileUnbanned: {
    inApp: {
      header: ({ userName }) => `${userName}, your profile has been unbanned. Please adhere to our policies.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    email: {
      subject: () => `Profile unbanned`,
      body: ({ userName }) => `Dear ${userName}, your profile has been unbanned. Please ensure you adhere to our policies going forward.`,
    },
    accountActivity: {
      name: ({ userName }) => `Profile unbanned for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'ProfileUnbanned',
      data: data => data,
    },
  },
  EmailUpdated: {
    inApp: {
      header: ({ userName }) => `Your email has been updated successfully, ${userName}.`,
      body: () => '',
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
    },
    email: {
      subject: () => `Email updated`,
      body: ({ userName }) => `Dear ${userName}, your email has been updated successfully.`,
    },
    accountActivity: {
      name: ({ userName }) => `Email updated for ${userName}.`,
    },
    analyticEvent: {
      eventName: 'EmailUpdated',
      data: data => data,
      identityData: data => data,
      sendIdentity: () => true,
    },
  },
  FeesApprovalRequired: {
    inApp: {
      header: ({ userName }) => `${userName}, please approve the fees to proceed.`,
      body: () => '',
      notificationType: NotificationsType.FEES_APPROVAL_REQUIRED,
      onObject: ({ investmentId }) => ({
        onObjectId: investmentId,
        onObjectType: NotificationObjectType.INVESTMENT,
      }),
    },
    push: {
      title: () => `Fees approval required.`,
      body: () => '',
    },
    email: {
      subject: () => 'Fee approval requirement',
      body: ({ userName }) => `Dear ${userName}, please approve the fees for your recent transaction to proceed.`,
    },
  },
};

function transactionAndTimeBody(tradeId: string, date: string): string {
  return `Transaction ID: ${tradeId}<br/>${timeBody(date)}`;
}

function timeBody(date: string): string {
  return `Time: ${DateTime.from(date).toFormattedDate('HH:mm:ss')}<br/>
      Date: ${DateTime.from(date).toFormattedDate('MM/DD/YYYY')}`;
}
