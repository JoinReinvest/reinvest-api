import {Id} from "LegalEntities/Domain/ValueObject/Id";
import {NonEmptyString, ValidationError} from "LegalEntities/Domain/ValueObject/TypeValidators";
import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";

export class Path extends NonEmptyString {
    constructor(value: string) {
        super(value, "path");
    }
}

export type FileInput = {
    id: string,
    path: string
}

export type AvatarInput = FileInput

export type IdScanInput = {
    ids: string[],
    path: string
}


export class IdentityDocument implements ToObject {
    private ids: Id[];
    private path: Path;

    constructor(ids: Id[], path: Path) {
        if (ids.length === 0) {
            throw new ValidationError("List ID scans can not be empty");
        }
        this.ids = ids;
        this.path = path;
    }

    static create(data: IdScanInput): IdentityDocument {
        try {
            const {ids, path} = data;
            const identifiers = ids.map((id: string) => new Id(id));

            return new IdentityDocument(identifiers, new Path(path));
        } catch (error: any) {
            throw new ValidationError("Missing some mandatory Id Scan fields");
        }
    }

    toObject(): IdScanInput {
        return {
            ids: this.ids.map((id) => id.toString()),
            path: this.path.toString(),
        }
    }
}

export class Avatar implements ToObject {
    private id: Id;
    private path: Path;

    constructor(id: Id, path: Path) {
        this.id = id;
        this.path = path;
    }

    static create(data: AvatarInput): Avatar {
        try {
            const {id, path} = data;

            return new Avatar(new Id(id), new Path(path));
        } catch (error: any) {
            throw new ValidationError("Missing some mandatory avatar fields");
        }
    }

    toObject(): AvatarInput {
        return {
            id: this.id.toString(),
            path: this.path.toString(),
        }
    }
}