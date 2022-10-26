import {AnyString, DateTime, EnumString, Money, NonEmptyString} from "./TypeValidators";

export class FirstName extends NonEmptyString {

}

export class LastName extends NonEmptyString {

}

export class Domicile extends EnumString {

}

export class NetWorth extends Money {
}

export class NetIncome extends Money {
}

export class DateOfBirth extends DateTime {
}

export class SSN extends NonEmptyString {
}

export class Employer extends AnyString {

}

export class Experience extends AnyString {

}