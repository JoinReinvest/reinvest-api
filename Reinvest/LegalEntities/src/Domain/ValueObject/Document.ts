import { Id } from 'LegalEntities/Domain/ValueObject/Id';
import { ToObject } from 'LegalEntities/Domain/ValueObject/ToObject';
import { NonEmptyString, ValidationError, ValidationErrorEnum } from 'LegalEntities/Domain/ValueObject/TypeValidators';

export class Path extends NonEmptyString {
  constructor(value: string) {
    super(value, 'path');
  }
}

export class FileName extends NonEmptyString {
  constructor(value: string) {
    super(value, 'fileName');
  }
}

export type FileInput = {
  id: string;
  path: string;
};

export type AvatarInput = FileInput;

export type IdScanInput = DocumentSchema[];

export type DocumentSchema = {
  fileName: string;
  id: string;
  path: string;
};

export class Document implements ToObject {
  private id: Id;
  private path: Path;
  private fileName: FileName;

  constructor(document: DocumentSchema) {
    this.id = new Id(document.id);
    this.path = new Path(document.path);
    this.fileName = new FileName(document.fileName);
  }

  isTheSameDocument(document: Document): boolean {
    return this.id.toString() === document.getId();
  }

  getId(): string {
    return this.id.toString();
  }

  toObject(): DocumentSchema {
    return {
      id: this.id.toString(),
      path: this.path.toString(),
      fileName: this.fileName.toString(),
    };
  }
}

export class IdentityDocument implements ToObject {
  private documents: Document[];

  constructor(documents: Document[]) {
    if (documents.length === 0) {
      throw new ValidationError(ValidationErrorEnum.EMPTY_VALUE, 'documents');
    }

    this.documents = documents;
  }

  static create(data: IdScanInput): IdentityDocument {
    try {
      const documents = data.map((document: DocumentSchema) => new Document(document));

      return new IdentityDocument(documents);
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, 'idScan', error.message);
    }
  }

  toObject(): DocumentSchema[] {
    return this.documents.map((document: Document) => document.toObject());
  }
}

export class CompanyDocuments implements ToObject {
  private documents: Document[];

  constructor(documents: Document[]) {
    this.documents = documents;
  }

  static create(data: DocumentSchema[]): CompanyDocuments {
    try {
      const documents = data.map((document: DocumentSchema) => new Document(document));

      return new CompanyDocuments(documents);
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, 'documents', error.message);
    }
  }

  toObject(): DocumentSchema[] {
    return this.documents.map((document: Document) => document.toObject());
  }

  addDocument(document: DocumentSchema): void {
    const documentToAdd = new Document(document);

    const documentsWithTheSameId = this.documents.filter((doc: Document) => doc.isTheSameDocument(documentToAdd));

    if (documentsWithTheSameId.length === 0) {
      this.documents.push(documentToAdd);
    }
  }

  removeDocument(document: DocumentSchema): void {
    const documentToRemove = new Document(document);
    this.documents = this.documents.filter((doc: Document) => !doc.isTheSameDocument(documentToRemove));
  }

  isEmpty(): boolean {
    return this.documents.length === 0;
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
      const { id, path } = data;

      return new Avatar(new Id(id), new Path(path));
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, 'avatar');
    }
  }

  toObject(): AvatarInput {
    return {
      id: this.id.toString(),
      path: this.path.toString(),
    };
  }
}
