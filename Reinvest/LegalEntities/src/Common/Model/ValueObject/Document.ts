import {NonEmptyString} from "./TypeValidators";
import {Id} from "./Id";

export class Path extends NonEmptyString {

}

export enum DocumentType {
    ID,
    Corporate,
    Other
}

export class Document {
    private id: Id;
    private path: Path;
    private type: DocumentType;

    constructor(id: Id, path: Path, type: DocumentType) {
        this.id = id;
        this.path = path;
        this.type = type;
    }
}

export class Documents {
    private documents: Document[];

    constructor(documents: Document[]) {
        this.documents = documents;
    }
}

export class IdentityDocument extends Document {

}