export class NonEmptyString {
  constructor() {}
}

export class AnyString {
  protected data: string;

  constructor(data = "") {
    this.data = data;
  }
}

export class EnumString {
  constructor() {}
}

export class Money {
  constructor() {}
}

export class DateTime {
  constructor() {}
}

export class IsoDate {
  constructor() {}
}

export class Uuid {
  constructor() {}
}

export class Url {
  constructor() {}
}
