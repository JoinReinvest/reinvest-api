import {Id} from "LegalEntities/Domain/ValueObject/Id";
import {NonEmptyString} from "LegalEntities/Domain/ValueObject/TypeValidators";

export class Path extends NonEmptyString {
}

export type AvatarInput = {
    id: string
}
export type IdScanInput = [{
    id: string
}]


export class IdentityDocument {
    private ids: Id[];
    private path: Path;

    // constructor(ids: Id[], path: Path) {
    //     this.ids = ids;
    //     this.path = path;
    // }

    static create(data: any): IdentityDocument {
        return new IdentityDocument();
    }
}

export class Avatar {
    private id: Id;
    private path: Path;

    // constructor(id: Id[], path: Path) {
    //     this.id = id;
    //     this.path = path;
    // }

    static create(data: any): Avatar {
        return new Avatar();
    }
}