import {ValidationError, ValidationErrorEnum} from "LegalEntities/Domain/ValueObject/TypeValidators";
import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";
import crypto from "crypto";

export type SensitiveNumberSchema = {
    anonymized: string,
    encrypted: string | null,
    hashed: string
}

type AnonymizationStrategy = (sensitiveNumber: string) => string | never;
type ValidationStrategy = (sensitiveNumber: string) => void | never;

export abstract class SensitiveNumber implements ToObject {
    private anonymized: string;
    private encrypted: string | null;
    private hashed: string;

    constructor(anonymized: string, encrypted: string | null, hashed: string) {
        this.encrypted = encrypted;
        this.hashed = hashed;
        this.anonymized = anonymized;
    }

    protected static createFromSchema(sensitiveNumber: SensitiveNumberSchema | string, validationStrategy: ValidationStrategy, anonymizationStrategy: AnonymizationStrategy): SensitiveNumberSchema {
        try {
            if (typeof sensitiveNumber === "string") { // backward compatibility
                return SensitiveNumber.createFromRawValue(sensitiveNumber, validationStrategy, anonymizationStrategy);
            }
            const {anonymized, encrypted, hashed} = sensitiveNumber;

            return {anonymized, encrypted, hashed};
        } catch (error: any) {
            throw new ValidationError(ValidationErrorEnum.EMPTY_VALUE, "sensitiveNumber");
        }
    }

    protected static createFromRawValue(sensitiveNumber: string, validationStrategy: ValidationStrategy, anonymizationStrategy: AnonymizationStrategy): SensitiveNumberSchema {
        try {
            validationStrategy(sensitiveNumber);
            const anonymized = anonymizationStrategy(sensitiveNumber);
            const encrypted = SensitiveNumber.encrypt(sensitiveNumber, anonymized);
            const hashed = SensitiveNumber.hash(sensitiveNumber);

            return {anonymized, encrypted, hashed};
        } catch (error: any) {
            throw new ValidationError(ValidationErrorEnum.EMPTY_VALUE, "sensitiveNumber");
        }
    }

    toObject(): SensitiveNumberSchema {
        return {
            anonymized: this.anonymized,
            encrypted: this.encrypted,
            hashed: this.hashed,
        };
    }

    private static encrypt(sensitiveNumber: string, anonymized: string) {
        const algorithm = "aes-256-cbc";
        const vector = anonymized.slice(0, 16).padEnd(16, '#');
        const hash = SensitiveNumber.hash(sensitiveNumber);
        const key = hash.slice(0, 32).padEnd(32, '#');
        const cipher = crypto.createCipheriv(algorithm, key, vector);
        const encrypted = cipher.update(sensitiveNumber, "utf-8", "hex");

        return encrypted + cipher.final('hex');
    }

    public decrypt(): string | never {
        if (this.encrypted === null) {
            throw new Error('SENSITIVE_NUMBER_IS_NO_LONGER_STORED');
        }

        const algorithm = "aes-256-cbc";
        const initVector = this.anonymized;
        const key = this.hashed.slice(0, 32).padEnd(32, '#');
        const vector = initVector.slice(0, 16).padEnd(16, '#');
        const decipher = crypto.createDecipheriv(algorithm, key, vector);
        const decryptedData = decipher.update(this.encrypted, "hex", "utf-8");

        return decryptedData + decipher.final("utf8");
    }

    public getHash(): string {
        return this.hashed;
    }

    private static hash(sensitiveNumber: string) {
        return crypto
            .createHash('sha256')
            .update(sensitiveNumber)
            .digest('hex')
    }
}

export type SensitiveNumberInput = string;

export class SSN extends SensitiveNumber {
    static validateSSN(sensitiveNumber: string): void | never {
        const sensitiveNumberRegExp = new RegExp("^[0-9]{3}-[0-9]{2}-[0-9]{4}$")
        if (!sensitiveNumberRegExp.test(sensitiveNumber)) {
            throw new ValidationError(ValidationErrorEnum.INVALID_FORMAT, "ssn");
        }
    }

    static anonymize(sensitiveNumber: string): string {
        return `***-**-${sensitiveNumber.slice(-4)}`;
    }

    static create(sensitiveNumber: SensitiveNumberSchema | string): SSN {
        const {anonymized, encrypted, hashed} = super.createFromSchema(sensitiveNumber, SSN.validateSSN, SSN.anonymize);

        return new SSN(anonymized, encrypted, hashed);
    }

    static createFromRawSSN(sensitiveNumber: string): SSN {
        const {
            anonymized,
            encrypted,
            hashed
        } = super.createFromRawValue(sensitiveNumber, SSN.validateSSN, SSN.anonymize);

        return new SSN(anonymized, encrypted, hashed);
    }
}

export class EIN extends SensitiveNumber {
    static validateEIN(sensitiveNumber: string): void | never {
        const sensitiveNumberRegExp = new RegExp('^[1-9][0-9]?-[0-9]{7}$')
        if (!sensitiveNumberRegExp.test(sensitiveNumber)) {
            throw new ValidationError(ValidationErrorEnum.INVALID_FORMAT, "ein");
        }
    }

    static anonymize(sensitiveNumber: string): string {
        return `**-***${sensitiveNumber.slice(-4)}`;
    }

    static create(sensitiveNumber: SensitiveNumberSchema): EIN {
        const {anonymized, encrypted, hashed} = super.createFromSchema(sensitiveNumber, EIN.validateEIN, EIN.anonymize);

        return new EIN(anonymized, encrypted, hashed);
    }

    static createFromRawEIN(sensitiveNumber: string): EIN {
        const {
            anonymized,
            encrypted,
            hashed
        } = super.createFromRawValue(sensitiveNumber, EIN.validateEIN, EIN.anonymize);

        return new EIN(anonymized, encrypted, hashed);
    }
}
