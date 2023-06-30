import { SessionContext } from 'ApiGateway/index';
import dayjs from 'dayjs';
import { GraphQLError } from 'graphql';
import { Notifications } from 'Notifications/index';

const schema = `
    #graphql
    enum NotificationType {
        DIVIDEND_RECEIVED
        REWARD_DIVIDEND_RECEIVED
        DIVIDEND_REINVESTED
        DIVIDEND_REINVESTED_AUTOMATICALLY
        DIVIDEND_PAYOUT_INITIATED

        INVESTMENT_FAILED
        INVESTMENT_FUNDS_RECEIVED
        RECURRING_INVESTMENT_FAILED

        VERIFICATION_FAILED
        FUNDS_WITHDRAWAL_REJECTED
        FUNDS_WITHDRAWAL_ACCEPTED

        GENERIC_NOTIFICATION
    }

    enum NotificationObjectType {
        INVESTMENT
        DIVIDEND
        ACCOUNT
    }

    type NotificationObject {
        id: ID!
        type: NotificationObjectType
    }

    type NotificationsStats {
        accountId: ID!
        unreadCount: Int!
        totalCount: Int!
    }

    type Notification {
        id: ID!
        notificationType: NotificationType!
        header: String!
        body: String!
        date: ISODateTime!
        isRead: Boolean!
        isDismissible: Boolean!
        accountId: String
        onObject: NotificationObject
    }

    enum NotificationFilter {
        ALL
        UNREAD
    }

    type Query {
        """
        Get all notifications for the given account id
        It sort notifications by date descending. Not dismissible (pinned) notifications are always first.
        """
        getNotifications(accountId: ID!, filter: NotificationFilter = ALL, pagination: Pagination = {page: 0, perPage: 10}): [Notification]!

        """
        Provides info about the number of unread/total notifications for the given account id
        It allows to retrieve notifications directly in the same query
        """
        getNotificationStats(accountId: ID!): NotificationsStats!
    }

    type Mutation {
        """
        Mark notification as read
        """
        markNotificationAsRead(notificationId: ID!): Boolean!
    }

`;

export const notificationsMock = (accountId: string, isRead: boolean = false, page: number = 0, perPage: number = 10) => {
  const notification = [
    {
      id: '2ffb89ce-7ab6-4e05-a20d-ef8cc7f3de8d',
      notificationType: 'DIVIDEND_RECEIVED',
      header: 'Dividend Update (mock)',
      body: 'You earned {{$10}} in dividends. Reinvest or withdraw your dividend.',
      date: dayjs().subtract(3, 'week').format('YYYY-MM-DDTHH:mm:ss'),
      isRead,
      isDismissible: false,
      accountId,
      onObject: {
        id: '24ab65cf-40c4-44a3-9804-212a78c4da83',
        type: 'DIVIDEND',
      },
    },
    {
      id: '4943a48e-f2b1-4057-94a5-cef006393119',
      notificationType: 'GENERIC_NOTIFICATION',
      header: 'This is some notification (mock)',
      body: 'This is generic notification test. Just display it and no other action required.',
      date: dayjs().subtract(1, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
      isRead,
      isDismissible: true,
      accountId,
    },
    {
      id: '02ff8981-ebc5-42e5-ab36-a71cc3f27b72',
      notificationType: 'INVESTMENT_FAILED',
      header: 'Investment Failed (mock)',
      body: "Your recent investment {{3009334}} failed. We'll try to process payment again over the next few days. To process investment., you may need to update your billing details",
      date: dayjs().subtract(10000, 'minutes').format('YYYY-MM-DDTHH:mm:ss'),
      isRead,
      isDismissible: true,
      accountId,
      onObject: {
        id: '7c0d0826-d0fb-41e7-b23f-f89c44748e15',
        type: 'INVESTMENT',
      },
    },
    {
      id: 'cff0acd7-2a1e-45d3-940e-12cce317d553',
      notificationType: 'RECURRING_INVESTMENT_FAILED',
      header: 'Your Recurring investment failed (mock)',
      body: 'Lorem ipsum, but go and see if you can unsuspend it :)',
      date: dayjs().subtract(123, 'minutes').format('YYYY-MM-DDTHH:mm:ss'),
      isRead,
      isDismissible: true,
      accountId,
    },
    {
      id: '98c9eb8f-4d51-486c-9e00-506c65a4b3c9',
      notificationType: 'VERIFICATION_FAILED',
      header: 'Investment Failed (mock)',
      body: '{{The verification of your account failed.}} Please update your data to carry on investing.',
      date: dayjs().subtract(10, 'minutes').format('YYYY-MM-DDTHH:mm:ss'),
      isRead,
      isDismissible: true,
      accountId,
    },
  ];

  return notification
    .sort(function (a: { date: string }, b: { date: string }) {
      // @ts-ignore
      return new Date(b.date) - new Date(a.date);
    })
    .sort(function (a: { date: string; isDismissible: boolean }, b: { date: string; isDismissible: boolean }) {
      // @ts-ignore
      return a.isDismissible === b.isDismissible ? new Date(b.date) - new Date(a.date) : a.isDismissible == true ? 1 : -1;
    })
    .slice(page * perPage, (page + 1) * perPage);
};

export const Notification = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getNotifications: async (parent: any, { accountId, filter, pagination }: any, { profileId, modules }: SessionContext) => {
        if (accountId.length === 0) {
          throw new GraphQLError('Account id is required');
        }

        const api = modules.getApi<Notifications.ApiType>(Notifications);
        const notifications = await api.getNotifications(profileId, accountId, filter, pagination);

        return [...notifications];
      },
      getNotificationStats: async (parent: any, { accountId, pagination }: any, { profileId, modules }: SessionContext) => {
        if (accountId.length === 0) {
          throw new GraphQLError('Account id is required');
        }

        const api = modules.getApi<Notifications.ApiType>(Notifications);
        const { unreadCount, totalCount } = await api.getNotificationsStats(profileId, accountId);

        return {
          accountId,
          unreadCount: unreadCount,
          totalCount: totalCount,
        };
      },
    },
    Mutation: {
      markNotificationAsRead: async (parent: any, { notificationId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Notifications.ApiType>(Notifications);

        return api.dismissNotifications(profileId, [notificationId]);
      },
    },
  },
};
