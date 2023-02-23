import {PersonalName} from "LegalEntities/Domain/ValueObject/PersonalName";
import {DateOfBirth} from "LegalEntities/Domain/ValueObject/DateOfBirth";
import {Address} from "LegalEntities/Domain/ValueObject/Address";
import {Avatar, IdentityDocument} from "LegalEntities/Domain/ValueObject/Document";
import {Domicile} from "LegalEntities/Domain/ValueObject/Domicile";
import {PersonalStatement} from "LegalEntities/Domain/ValueObject/PersonalStatements";

export class Profile {
    completeName(name: PersonalName) {

    }

    completeDateOfBirth(dateOfBirth: DateOfBirth) {

    }

    completeAddress(address: Address) {

    }

    completeIdentityDocument(identityDocument: IdentityDocument) {

    }

    completeAvatarDocument(avatar: Avatar) {

    }

    completeDomicile(domicile: Domicile) {

    }

    addStatement(statement: PersonalStatement) {

    }

    isCompleted(): boolean {
        return false;
    }
}