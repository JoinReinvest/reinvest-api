import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';

export enum NotificationsType {
  DIVIDEND_RECEIVED = 'DIVIDEND_RECEIVED',
  REWARD_DIVIDEND_RECEIVED = 'REWARD_DIVIDEND_RECEIVED',
  DIVIDEND_REINVESTED = 'DIVIDEND_REINVESTED',
  DIVIDEND_REINVESTED_AUTOMATICALLY = 'DIVIDEND_REINVESTED_AUTOMATICALLY',
  DIVIDEND_PAYOUT_INITIATED = 'DIVIDEND_PAYOUT_INITIATED',
  INVESTMENT_FAILED = 'INVESTMENT_FAILED',
  INVESTMENT_FUNDS_RECEIVED = 'INVESTMENT_FUNDS_RECEIVED',
  RECURRING_INVESTMENT_FAILED = 'RECURRING_INVESTMENT_FAILED',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  FEES_APPROVAL_REQUIRED = 'FEES_APPROVAL_REQUIRED',
  FUNDS_WITHDRAWAL_REJECTED = 'FUNDS_WITHDRAWAL_REJECTED',
  FUNDS_WITHDRAWAL_ACCEPTED = 'FUNDS_WITHDRAWAL_ACCEPTED',
  GENERIC_NOTIFICATION = 'GENERIC_NOTIFICATION',
}

export enum NotificationObjectType {
  ACCOUNT = 'ACCOUNT',
  INVESTMENT = 'INVESTMENT',
  DIVIDEND = 'DIVIDEND',
}

export type NotificationSchema = {
  accountId: string | null;
  body: string;
  dateCreated: Date;
  dateRead: Date | null;
  dismissId: string;
  header: string;
  id: string;
  isDismissible: boolean;
  isRead: boolean;
  notificationType: NotificationsType;
  onObjectId: string | null;
  onObjectType: NotificationObjectType | null;
  profileId: string;
  uniqueId: string | null;
};
export type NotificationInput = {
  accountId: string | null;
  body: string;
  dismissId: string;
  header: string;
  id: string;
  notificationType: NotificationsType;
  onObjectId: string | null;
  onObjectType: NotificationObjectType | null;
  profileId: string;
  uniqueId: string | null;
};

export type NotificationView = {
  accountId: string | null;
  body: string;
  date: Date;
  header: string;
  id: string;
  isDismissible: boolean;
  isRead: boolean;
  notificationType: NotificationsType;
  onObject: {
    id: string;
    type: string;
  } | null;
};

export class Notification {
  private notificationSchema: NotificationSchema;

  constructor(notificationSchema: NotificationSchema) {
    this.notificationSchema = notificationSchema;
  }

  static create(notificationInput: NotificationInput) {
    const notificationSchema = <NotificationSchema>{
      ...notificationInput,
      dateCreated: DateTime.now().toDate(),
      dateRead: null,
      isRead: false,
      isDismissible: notificationInput.dismissId === notificationInput.id,
    };

    return new Notification(notificationSchema);
  }

  static restore(notificationSchema: NotificationSchema) {
    return new Notification(notificationSchema);
  }

  dismiss(dismissId: string): void {
    if (this.notificationSchema.dismissId !== dismissId || this.notificationSchema.isRead) {
      return;
    }

    this.notificationSchema.isRead = true;
    this.notificationSchema.dateRead = DateTime.now().toDate();
  }

  toObject() {
    return this.notificationSchema;
  }

  getView(): NotificationView {
    return {
      id: this.notificationSchema.id,
      notificationType: this.notificationSchema.notificationType,
      header: this.notificationSchema.header,
      body: this.notificationSchema.body,
      date: this.notificationSchema.dateCreated,
      isRead: this.notificationSchema.isRead,
      isDismissible: this.notificationSchema.isDismissible,
      accountId: this.notificationSchema.accountId,
      onObject: this.notificationSchema.onObjectId
        ? {
            id: this.notificationSchema!.onObjectId as string,
            type: this.notificationSchema!.onObjectType as NotificationObjectType,
          }
        : null,
    };
  }

  transferToAccount(accountId: UUID): void {
    this.notificationSchema.accountId = accountId;
  }
}
