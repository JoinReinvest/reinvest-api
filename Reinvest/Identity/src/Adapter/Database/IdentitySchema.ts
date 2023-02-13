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

export type InsertableUser = Insertable<IdentityUser>;