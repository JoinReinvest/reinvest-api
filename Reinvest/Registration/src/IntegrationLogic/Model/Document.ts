import { Id } from "../../Common/Model/Id";
import { Path } from "../../Common/Model/TypeValidators";

export class Document {
  get path(): Path {
    return this._path;
  }
  private id: Id;
  private _path: Path;
  private type: DocumentType;

  constructor(id: Id, path: Path, type: DocumentType) {
    this.id = id;
    this._path = path;
    this.type = type;
  }
}
