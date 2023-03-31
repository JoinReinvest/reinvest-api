import {PhoneController} from "Identity/Port/Api/PhoneController";
import {ContainerInterface} from "Container/Container";
import {UserRegistrationController} from "Identity/Port/Api/UserRegistrationController";
import {ProfileController} from "Identity/Port/Api/ProfileController";
import {IncentiveTokenController} from "Identity/Port/Api/IncentiveTokenController";

export type IdentityApiType = {
    verifyPhoneNumber: PhoneController["verifyPhoneNumber"],
    setPhoneNumber: PhoneController["setPhoneNumber"],
    isPhoneNumberCompleted: PhoneController["isPhoneNumberCompleted"],

    registerUser: UserRegistrationController['registerUser'],
    getProfileId: ProfileController['getProfileId'],

    getUserInvitationLink: IncentiveTokenController['getUserInvitationLink'],
    isIncentiveTokenValid: IncentiveTokenController['isIncentiveTokenValid'],
}

export const identityApi = (container: ContainerInterface): IdentityApiType => ({
    registerUser: container.delegateTo(UserRegistrationController, 'registerUser'),

    getProfileId: container.delegateTo(ProfileController, 'getProfileId'),
    isIncentiveTokenValid: container.delegateTo(IncentiveTokenController, 'isIncentiveTokenValid'),
    getUserInvitationLink: container.delegateTo(IncentiveTokenController, 'getUserInvitationLink'),

    setPhoneNumber: container.delegateTo(PhoneController, 'setPhoneNumber'),
    verifyPhoneNumber: container.delegateTo(PhoneController, 'verifyPhoneNumber'),
    isPhoneNumberCompleted: container.delegateTo(PhoneController, 'isPhoneNumberCompleted'),
})
