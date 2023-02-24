import DateTime from 'date-and-time';

export class ValidationError extends Error {
}

export class NonEmptyString {
    protected value;

    constructor(value: string, name: string = 'NonEmptyString') {
        if (value.length === 0) {
            throw new ValidationError(`Empty value for ${name}`);
        }

        this.value = value;
    }

    toString(): string {
        return this.value;
    }
}

export class AnyString {
    protected value: string;

    constructor(value: string = "") {
        this.value = value;
    }

    toString(): string {
        return this.value;
    }
}

export class EnumString {
    private value: string;

    constructor(value: string, options: string[]) {
        if (!(value in options)) {
            throw new ValidationError(`Value "${value} is not on of ${options}`);
        }

        this.value = value;
    }

    toString(): string {
        return this.value;
    }
}

export class Money {
    constructor() {
    }
}

export class IsoDate {
    constructor(date: string) {
        if (!DateTime.isValid(date, 'YYYY-MM-DD')) {
            throw new ValidationError("The value format must be YYYY-MM-DD");
        }
    }
}

export class Uuid {
    protected uuid: string;

    constructor(uuid: string) {
        this.uuid = uuid;
    }

    toString(): string {
        return this.uuid;
    }
}

export class Url {
    constructor() {
    }
}
