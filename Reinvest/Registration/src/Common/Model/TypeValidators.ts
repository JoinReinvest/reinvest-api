export class NonEmptyString {
    constructor() {
    }

}

export class AnyString {
    protected data: string;

    constructor(data: string = "") {
        this.data = data;
    }

}

export class EnumString {
    constructor() {
    }

}

export class Money {
    constructor() {
    }

}

export class DateTime {
    constructor() {
    }

}

export class Uuid {
    constructor(uuid: string) {
    }

}

export class Url {
    constructor() {
    }

}

export class Path extends NonEmptyString {

}