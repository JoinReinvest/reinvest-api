import { JSONObjectOf } from 'HKEKTypes/Generics';
import { BanList } from 'Identity/Port/Api/BanController';
import { Insertable } from 'kysely';

export interface IdentityUser {
  bannedIdsJson: JSONObjectOf<BanList>;
  cognitoUserId: string;
  createdAt: string;
  email: string;
  id: string;
  invitedByIncentiveToken: string;
  label: string;
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
