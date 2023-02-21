import {Insertable} from "kysely";

export interface IdentityUser {
    id: string;
    cognitoUserId: string;
    profileId: string;
    email: string;
    invitedByIncentiveToken: string;
    userIncentiveToken: string;
    createdAt: string;
}

export interface IdentityPhoneVerification {
    userId: string;
    countryCode: string;
    phoneNumber: string;
    topt: string;
    tries: number,
    createdAt: Date;
    expiresAfterMinutes: number;
}

export type InsertableUser = Insertable<IdentityUser>;
export type InsertableOneTimeToken = Insertable<IdentityPhoneVerification>;