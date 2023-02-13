export enum USER_EXCEPTION_CODES {
    USER_ALREADY_EXISTS = 1001
}

export class UserException extends Error {
    exceptionCode: USER_EXCEPTION_CODES;

    constructor(code: USER_EXCEPTION_CODES, message: string) {
        super(`User exception: [${code}] ${message}`);
        this.exceptionCode = code;
    }

    ifUserAlreadyExists() {
        return this.exceptionCode === USER_EXCEPTION_CODES.USER_ALREADY_EXISTS;
    }
}