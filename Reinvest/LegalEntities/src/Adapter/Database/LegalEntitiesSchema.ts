import {Insertable} from "kysely";

// export interface LegalEntitiesPerson {
//     person_id: string;
//     date_created: Date;
//     name: string;
//     dob: string;
//     address: string;
//     id_scans_ids: string;
//     domicile: string;
//     ssn: string;
//     is_completed: boolean;
// }

export interface LegalEntitiesProfile {
    profileId: string;
    externalId: string;
    label: string;
    name: string | null;
    ssn: string | null;
    dateOfBirth: string | null;
    address: string | null;
    idScan: string | null;
    avatar: string | null;
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

export const LegalEntitiesJsonFields = ['name', 'dateOfBirth', 'address', 'idScan', 'avatar', 'domicile', 'statements', 'investingExperience'];
export const accountDraftFields = ['profileId', 'draftId', 'state', 'accountType', 'data'];

export type InsertableProfile = Insertable<LegalEntitiesProfile>;
// export type InsertablePerson = Insertable<LegalEntitiesPerson>;