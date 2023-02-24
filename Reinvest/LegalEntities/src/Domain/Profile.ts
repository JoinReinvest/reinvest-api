import {PersonalName, PersonalNameInput} from "LegalEntities/Domain/ValueObject/PersonalName";
import {DateOfBirth, DateOfBirthInput} from "LegalEntities/Domain/ValueObject/DateOfBirth";
import {Address, AddressInput} from "LegalEntities/Domain/ValueObject/Address";
import {Avatar, AvatarInput, IdentityDocument, IdScanInput} from "LegalEntities/Domain/ValueObject/Document";
import {Domicile, DomicileInput} from "LegalEntities/Domain/ValueObject/Domicile";
import {PersonalStatement, PersonalStatementInput} from "LegalEntities/Domain/ValueObject/PersonalStatements";
import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";
import {SSN} from "LegalEntities/Domain/ValueObject/SSN";

export type ProfileInputType = {
    profileId: string,
    externalId: string,
    label: string,
    name: PersonalNameInput | null,
    ssn: SSN | null,
    dateOfBirth: DateOfBirthInput | null,
    address: AddressInput | null,
    idScan: IdScanInput | null,
    avatar: AvatarInput | null,
    domicile: DomicileInput | null,
    statements: PersonalStatementInput[]
}

export class Profile {
    private profileId: string;
    private externalId: string;
    private label: string;
    private ssn: SSN | null = null;
    private name: PersonalName | null = null;
    private dateOfBirth: DateOfBirth | null = null;
    private address: Address | null = null;
    private idScan: IdentityDocument | null = null;
    private avatar: Avatar | null = null;
    private domicile: Domicile | null = null;
    private statements: PersonalStatement[] = [];

    constructor(profileId: string, externalId: string, label: string) {
        this.profileId = profileId;
        this.externalId = externalId;
        this.label = label;
    }

    setSSN(ssn: SSN): void {
        this.ssn = ssn;
    }

    setName(name: PersonalName) {
        this.name = name;
        this.label = name.getLabel();
    }

    setDateOfBirth(dateOfBirth: DateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    setAddress(address: Address) {
        this.address = address;
    }

    setIdentityDocument(idScan: IdentityDocument) {
        this.idScan = idScan;
    }

    setAvatarDocument(avatar: Avatar) {
        this.avatar = avatar;
    }

    setDomicile(domicile: Domicile) {
        this.domicile = domicile;
    }

    addStatement(statement: PersonalStatement) {
        this.statements.push(statement);
    }

    isCompleted(): boolean {
        return false;
    }

    static create(data: ProfileInputType) {

    }

    toObject(): ProfileInputType {
        return {
            profileId: this.profileId,
            externalId: this.externalId,
            label: this.label,
            ssn: this.get(this.ssn),
            name: this.get(this.name),
            dateOfBirth: this.get(this.dateOfBirth),
            address: this.get(this.address),
            idScan: this.get(this.idScan),
            avatar: this.get(this.avatar),
            domicile: this.get(this.domicile),
            statements: this.statements.map(statement => statement.toObject()),
        }
    }

    private get(value: ToObject | null) {
        if (value === null) {
            return null;
        }

        return value.toObject();
    }
}