import {Insertable} from "kysely";

export interface LegalEntitiesProfile {
    profileId: string;
    externalId: string;
    label: string;
    name: string | null;
    ssn: string | null;
    ssnObject: string | null;
    dateOfBirth: string | null;
    address: string | null;
    idScan: string | null;
    domicile: string | null;
    statements: string | null;
    investingExperience: string | null;
    isCompleted: boolean;
};

export interface LegalEntitiesDraftAccount {
    draftId: string;
    profileId: string;
    state: string;
    accountType: string;
    data: string | null;
};

export interface LegalEntitiesIndividualAccount {
    accountId: string;
    profileId: string;
    employmentStatus: string | null;
    employer: string | null;
    netWorth: string | null;
    netIncome: string | null;
    avatar: string | null;
};

export const LegalEntitiesJsonFields = ['name', 'dateOfBirth', 'address', 'idScan', 'domicile', 'statements', 'investingExperience', 'ssnObject'];

export type InsertableProfile = Insertable<LegalEntitiesProfile>;
export type InsertableDraftAccount = Insertable<LegalEntitiesDraftAccount>;