import {PhoneController} from "Identity/Port/Api/PhoneController";
import {ContainerInterface} from "Container/Container";
import {UserRegistrationController} from "Identity/Port/Api/UserRegistrationController";
import {ProfileController} from "Identity/Port/Api/ProfileController";
import {IncentiveTokenVerificationController} from "Identity/Port/Api/IncentiveTokenVerificationController";

export type IdentityApiType = {
    verifyPhoneNumber: PhoneController["verifyPhoneNumber"],
    setPhoneNumber: PhoneController["setPhoneNumber"],

    registerUser: UserRegistrationController['registerUser'],
    getProfileId: ProfileController['getProfileId'],
    isIncentiveTokenValid: IncentiveTokenVerificationController['isIncentiveTokenValid'],
}

export const identityApi = (container: ContainerInterface): IdentityApiType => ({
    registerUser: container.delegateTo(UserRegistrationController, 'registerUser'),

    getProfileId: container.delegateTo(ProfileController, 'getProfileId'),
    isIncentiveTokenValid: container.delegateTo(IncentiveTokenVerificationController, 'isIncentiveTokenValid'),

    setPhoneNumber: container.delegateTo(PhoneController, 'setPhoneNumber'),
    verifyPhoneNumber: container.delegateTo(PhoneController, 'verifyPhoneNumber'),
})
