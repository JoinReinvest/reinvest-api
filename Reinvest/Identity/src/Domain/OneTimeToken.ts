import {PhoneEvent, TOPTExpired, TOPTInvalid, TOPTTriesExceeded, TOPTVerified} from "Identity/Domain/PhoneEvents";

const TOPT_EXPIRATION_IN_MINUTES = 10;
import DateTime from 'date-and-time';
import {PhoneNumber} from "Identity/Domain/PhoneNumber";

const MAX_TRIES = 3;

export class OneTimeToken {
    private token: string;
    private phoneNumber: PhoneNumber;
    private userId: string;
    private createdAt: Date;
    private expirationInMinutes: number = TOPT_EXPIRATION_IN_MINUTES;
    private tries: number = 0;

    constructor(
        userId: string,
        token: string,
        phoneNumber: PhoneNumber,
        createdAt: Date = new Date(),
        expirationInMinutes: number = TOPT_EXPIRATION_IN_MINUTES,
        tries: number = 0
    ) {
        this.phoneNumber = phoneNumber;
        this.userId = userId;
        this.tries = tries;
        this.token = this.normalize(token);
        this.createdAt = createdAt;
        this.expirationInMinutes = expirationInMinutes;
    }

    public toArray(): any {
        return {
            userId: this.userId,
            topt: this.token,
            createdAt: this.createdAt,
            tries: this.tries,
            expiresAfterMinutes: this.expirationInMinutes,
            countryCode: this.phoneNumber.getCountryCode(),
            phoneNumber: this.phoneNumber.getPhoneNumber(),
        }
    }

    public getSms() {
        return {
            phoneNumber: this.phoneNumber.getFullPhoneNumber(),
            code: this.token
        }
    }

    public verifyToken(TOPTToken: string): PhoneEvent {
        const token = this.normalize(TOPTToken);

        if (this.isTriesExceeded()) {
            return this.event<TOPTTriesExceeded>('TOPTTriesExceeded');
        }
        if (this.isExpired()) {
            return this.event<TOPTExpired>('TOPTExpired');
        }

        if (this.tokenValid(token)) {
            return this.event<TOPTVerified>('TOPTVerified', {
                phoneNumber: this.phoneNumber.getFullPhoneNumber()
            });
        }

        return this.event<TOPTInvalid>('TOPTInvalid', {
            tries: this.tries + 1
        });
    }

    private isTriesExceeded(): boolean {
        return this.tries >= MAX_TRIES;
    }

    private tokenValid(token: string): boolean {
        return token === this.token;
    }

    private isExpired(): boolean {
        const expiresAt = DateTime.addMinutes(this.createdAt, this.expirationInMinutes)
        return new Date() >= expiresAt;
    }

    private event<Event>(kind: string, data: any = {}): Event {
        return <Event>{
            id: this.userId,
            kind,
            data
        }
    }

    private normalize(token: string): string {
        return token.toUpperCase();
    }
}