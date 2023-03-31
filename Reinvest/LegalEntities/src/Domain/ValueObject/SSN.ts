import crypto from 'crypto';
import { ToObject } from 'LegalEntities/Domain/ValueObject/ToObject';
import { ValidationError, ValidationErrorEnum } from 'LegalEntities/Domain/ValueObject/TypeValidators';

export type SSNInput = string;

export type SSNSchema = {
  anonymized: string;
  encrypted: string | null;
  hashed: string;
};

export class SSN implements ToObject {
  private anonymized: string;
  private encrypted: string | null;
  private hashed: string;

  constructor(anonymized: string, encrypted: string | null, hashed: string) {
    this.encrypted = encrypted;
    this.hashed = hashed;
    this.anonymized = anonymized;
  }

  static create(ssn: SSNSchema): SSN {
    try {
      if (typeof ssn === 'string') {
        // backward compatibility
        return SSN.createFromRawSSN(ssn);
      }

      const { anonymized, encrypted, hashed } = ssn;

      return new SSN(anonymized, encrypted, hashed);
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.EMPTY_VALUE, 'ssn');
    }
  }

  static createFromRawSSN(ssn: string): SSN {
    try {
      SSN.validate(ssn);
      const anonymized = SSN.anonymize(ssn);
      const encrypted = SSN.encrypt(ssn);
      const hashed = SSN.hash(ssn);

      return new SSN(anonymized, encrypted, hashed);
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.EMPTY_VALUE, 'ssn');
    }
  }

  toObject(): SSNSchema {
    return {
      anonymized: this.anonymized,
      encrypted: this.encrypted,
      hashed: this.hashed,
    };
  }

  private static validate(ssn: string) {
    const ssnRegExp = new RegExp('^[0-9]{3}-[0-9]{2}-[0-9]{4}$');

    if (!ssnRegExp.test(ssn)) {
      throw new ValidationError(ValidationErrorEnum.INVALID_FORMAT, 'ssn');
    }
  }

  private static anonymize(ssn: string) {
    return `***-**-${ssn.slice(-4)}`;
  }

  private static encrypt(ssn: string) {
    const algorithm = 'aes-256-cbc';
    const anonymized = SSN.anonymize(ssn);
    const vector = anonymized.slice(0, 16).padEnd(16, '#');
    const hash = SSN.hash(ssn);
    const key = hash.slice(0, 32).padEnd(32, '#');
    const cipher = crypto.createCipheriv(algorithm, key, vector);
    const encrypted = cipher.update(ssn, 'utf-8', 'hex');

    return encrypted + cipher.final('hex');
  }

  public decrypt(): string | never {
    if (this.encrypted === null) {
      throw new Error('SSN_IS_NO_LONGER_STORED');
    }

    const algorithm = 'aes-256-cbc';
    const initVector = this.anonymized;
    const key = this.hashed.slice(0, 32).padEnd(32, '#');
    const vector = initVector.slice(0, 16).padEnd(16, '#');
    const decipher = crypto.createDecipheriv(algorithm, key, vector);
    const decryptedData = decipher.update(this.encrypted, 'hex', 'utf-8');

    return decryptedData + decipher.final('utf8');
  }

  public getHash(): string {
    return this.hashed;
  }

  private static hash(ssn: string) {
    return crypto.createHash('sha256').update(ssn).digest('hex');
  }
}
