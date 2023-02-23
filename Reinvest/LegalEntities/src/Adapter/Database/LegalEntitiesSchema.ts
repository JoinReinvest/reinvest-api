import {Insertable} from "kysely";

export interface LegalEntitiesPerson {
    person_id: string;
    date_created: Date;
    name: string;
    dob: string;
    address: string;
    id_scans_ids: string;
    domicile: string;
    ssn: string;
    is_completed: boolean;
}

export interface LegalEntitiesProfile {
    profile_id: string;
    external_id: string;
    date_created: Date;
    label: string;
    avatar_id: string;
    name: string;
    dob: string;
    address: string;
    id_scans_ids: string;
    domicile: string;
    ssn: string;
    statements: string;
    is_completed: boolean;
}

export type InsertableProfile = Insertable<LegalEntitiesProfile>;
export type InsertablePerson = Insertable<LegalEntitiesPerson>;