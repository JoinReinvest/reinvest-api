import {
    IdentityDatabase,
    IdentityDatabaseAdapterProvider, PhoneCodeRow, phoneVerificationTable, UpdateablePhoneCodeRow
} from "Identity/Adapter/Database/IdentityDatabaseAdapter";
import {InsertableOneTimeToken} from "Identity/Adapter/Database/IdentitySchema";
import {OneTimeToken} from "Identity/Domain/OneTimeToken";
import {PhoneNumber} from "Identity/Domain/PhoneNumber";
import {PhoneException} from "Identity/Domain/Exception/PhoneException";
import {PhoneEvent} from "Identity/Domain/PhoneEvents";
import {TransactionalAdapter} from "PostgreSQL/TransactionalAdapter";
import {SmsService} from "Identity/Adapter/AWS/SmsService";
import {CognitoService} from "Identity/Adapter/AWS/CognitoService";

export class PhoneRepository {
    public static getClassName = (): string => "PhoneRepository";
    private databaseAdapterProvider: IdentityDatabaseAdapterProvider;
    private transactionalAdapter: TransactionalAdapter<IdentityDatabase>;
    private cognitoService: CognitoService;
    private smsService: SmsService;

    constructor(
        databaseAdapterProvider: IdentityDatabaseAdapterProvider,
        transactionalAdapter: TransactionalAdapter<IdentityDatabase>,
        smsService: SmsService,
        cognitoService: CognitoService
    ) {
        this.cognitoService = cognitoService;
        this.smsService = smsService;
        this.databaseAdapterProvider = databaseAdapterProvider;
        this.transactionalAdapter = transactionalAdapter;
    }

    public async storeToken(oneTimeToken: OneTimeToken): Promise<boolean> {
        const {userId} = oneTimeToken.toArray();
        return this.transactionalAdapter.transaction(
            `Sending TOPT to phone for user ${userId}`,
            async () => {
                // store in the db transitionally
                await this.createToken(oneTimeToken);
                await this.smsService.sendSmsWithToken(oneTimeToken);
            });
    }

    private async createToken(oneTimeToken: OneTimeToken) {
        try {
            const dataToInsert = {
                ...oneTimeToken.toArray(),
            }
            await this.databaseAdapterProvider.provide()
                .insertInto(phoneVerificationTable)
                .values(<InsertableOneTimeToken>{
                    ...dataToInsert
                })
                .onConflict((oc) => oc
                    .column('userId')
                    .doUpdateSet({
                        ...dataToInsert
                    })
                )
                .execute();
        } catch (error: any) {
            console.log({PhoneRepository_storeToken: error});
            throw new PhoneException('Cannot store phone verification: ' + error.message);
        }
    }

    public async findToken(userId: string, phone: PhoneNumber): Promise<OneTimeToken | never> {
        const {topt, createdAt, expiresAfterMinutes, tries} = await this.databaseAdapterProvider.provide()
            .selectFrom(phoneVerificationTable)
            .select(['topt', 'tries', 'createdAt', 'expiresAfterMinutes'])
            .castTo<PhoneCodeRow>()
            .where('userId', '=', userId)
            .where('countryCode', '=', phone.getCountryCode())
            .where('phoneNumber', '=', phone.getPhoneNumber())
            .limit(1)
            .executeTakeFirstOrThrow();

        return new OneTimeToken(userId, topt, phone, createdAt, expiresAfterMinutes, Number(tries));
    }

    public async applyEvent(event: PhoneEvent): Promise<boolean> {
        const {id: userId, kind} = event;
        switch (kind) {
            case 'TOPTExpired':
            case 'TOPTTriesExceeded':
                await this.removeToken(userId);
                console.log('Token failed: ' + kind);
                break;
            case 'TOPTInvalid':
                const tries = event.data.tries as number;
                await this.update(userId, <UpdateablePhoneCodeRow>{tries});
                console.log('Token failed: ' + kind);
                break;
            case 'TOPTVerified':
                return this.updateToken(userId, event.data.phoneNumber);
            default:
                return false;
        }

        return false;
    }

    private async updateToken(userId: string, phoneNumber: string): Promise<boolean> {
        return this.transactionalAdapter.transaction(
            `Saving phone number verification for user ${userId}`,
            async () => {
                await this.removeToken(userId);
                await this.cognitoService.addVerifiedPhoneNumber(userId, phoneNumber);
            });
    }

    private async removeToken(userId: string): Promise<void> {
        await this.databaseAdapterProvider.provide()
            .deleteFrom(phoneVerificationTable)
            .where('userId', '=', userId)
            .execute();
    }

    private async update(userId: string, toUpdate: UpdateablePhoneCodeRow): Promise<void> {
        await this.databaseAdapterProvider.provide()
            .updateTable(phoneVerificationTable)
            .set(toUpdate)
            .where('userId', '=', userId)
            .execute();
    }
}