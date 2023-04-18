import { Insertable } from 'kysely';

export interface IdentityUser {
  cognitoUserId: string;
  createdAt: string;
  email: string;
  id: string;
  invitedByIncentiveToken: string;
  profileId: string;
  userIncentiveToken: string;
}

export interface IdentityPhoneVerification {
  countryCode: string;
  createdAt: Date;
  expiresAfterMinutes: number;
  phoneNumber: string;
  topt: string;
  tries: number;
  userId: string;
}

export type InsertableUser = Insertable<IdentityUser>;
export type InsertableOneTimeToken = Insertable<IdentityPhoneVerification>;
