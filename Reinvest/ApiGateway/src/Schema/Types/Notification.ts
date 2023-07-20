import { SessionContext } from 'ApiGateway/index';
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
        FEES_APPROVAL_REQUIRED

        VERIFICATION_FAILED
        FUNDS_WITHDRAWAL_REJECTED
        FUNDS_WITHDRAWAL_ACCEPTED

        GENERIC_NOTIFICATION
    }

    enum NotificationObjectType {
        INVESTMENT
        DIVIDEND
        ACCOUNT
        RECURRING_INVESTMENT
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

        """
        Register device for Firebase push notifications
        """
        registerPushNotificationDevice(deviceId: String!): Boolean!
    }

`;

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
      registerPushNotificationDevice: async (parent: any, { deviceId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Notifications.ApiType>(Notifications);
        const deviceIdTrimmed = deviceId.trim();

        if (!deviceIdTrimmed) {
          return false;
        }

        return api.registerPushNotificationDevice(profileId, deviceIdTrimmed);
      },
    },
  },
};
