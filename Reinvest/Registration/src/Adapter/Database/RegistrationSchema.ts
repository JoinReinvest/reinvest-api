export interface MappingRegistryTable {
    recordId: string;
    profileId: string;
    externalId: string;
    mappedType: string;
    email: string | null;
    status: "DIRTY" | "CLEAN";
    version: number;
    createdDate: string;
    updatedDate: string;
    lockedUntil: string | null;
};
