import { DictionaryType } from 'HKEKTypes/Generics';
import { Money } from 'Money/Money';
import { NotificationObjectType, NotificationsType } from 'Notifications/Domain/Notification';
import { StoredEventsType } from 'Notifications/Domain/StoredEventTypes';

export enum StoredEventKind {
  UserRegistered = 'UserRegistered',
  IndividualAccountOpened = 'IndividualAccountOpened',
  CorporateAccountOpened = 'CorporateAccountOpened',
  TrustAccountOpened = 'TrustAccountOpened',
  InvestmentProcessStarted = 'InvestmentProcessStarted',
  PaymentInitiated = 'PaymentInitiated',
  ArchivingBeneficiaryStarted = 'ArchivingBeneficiaryStarted',
  ArchivingBeneficiaryCompleted = 'ArchivingBeneficiaryCompleted',
  TransferringBeneficiaryToParentCompleted = 'TransferringBeneficiaryToParentCompleted',
  RecurringInvestmentSuspended = 'RecurringInvestmentSuspended',
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
      data: () => ({}),
      name: () => `REINVEST User registered`,
    },
  },
  CorporateAccountOpened: {
    accountActivity: {
      data: ({ accountId, label }) => ({ accountId, label }),
      name: ({ label }) => `Corporate Account "${label}" opened`,
    },
  },
  TrustAccountOpened: {
    accountActivity: {
      data: ({ accountId, label }) => ({ accountId, label }),
      name: ({ label }) => `Trust Account "${label}" opened`,
    },
  },
  IndividualAccountOpened: {
    accountActivity: {
      data: ({ accountId }) => ({ accountId }),
      name: () => 'Individual Account opened',
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
    accountActivity: {
      data: ({ amount, fee, tradeId, investmentId }) => ({
        amount,
        fee,
        tradeId,
        investmentId,
      }),
      name: paymentInitiatedBody,
    },
    inApp: {
      header: ({ tradeId }) => `Payment initiated for trade ${tradeId}`,
      body: paymentInitiatedBody,
      notificationType: NotificationsType.GENERIC_NOTIFICATION,
      onObject: ({ investmentId }) => ({
        onObjectId: investmentId,
        onObjectType: NotificationObjectType.INVESTMENT,
      }),
    },
    push: {
      title: ({ tradeId }) => `Payment initiated for trade ${tradeId}`,
      body: paymentInitiatedBody,
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
};

function investmentStartedBody({ amount, tradeId }: DictionaryType): string {
  const castedAmount = parseInt(amount);
  const formattedAmount = Money.lowPrecision(castedAmount).getFormattedAmount();

  return `Trade ${tradeId} started with amount ${formattedAmount}`;
}

function paymentInitiatedBody({ amount, tradeId, fee }: DictionaryType): string {
  const castedAmount = parseInt(amount);
  const formattedAmount = Money.lowPrecision(castedAmount).getFormattedAmount();
  let feeIncluded = '';

  if (fee) {
    const feeFormattedAmount = Money.lowPrecision(parseInt(fee)).getFormattedAmount();
    feeIncluded = ` (${feeFormattedAmount} fee included)`;
  }

  return `Payment initiated for trade ${tradeId} with amount ${formattedAmount}${feeIncluded}`;
}
