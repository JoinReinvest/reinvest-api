import {PhoneController} from "Identity/Port/Api/PhoneController";
import {ContainerInterface} from "Container/Container";
import {UserRegistrationController} from "Identity/Port/Api/UserRegistrationController";

export type IdentityApiType = {
    verifyPhoneNumber: PhoneController["verifyPhoneNumber"],
    setPhoneNumber: PhoneController["setPhoneNumber"],

    registerUser: UserRegistrationController['registerUser'],
    getProfileId: Function
}

export const identityApi = (container: ContainerInterface): IdentityApiType => ({
    registerUser: container.delegateTo(UserRegistrationController, 'registerUser'),

    getProfileId: (userId: string): string => '27fad77f-f160-44a8-8611-b19f6e76a253',

    setPhoneNumber: container.delegateTo(PhoneController, 'setPhoneNumber'),
    verifyPhoneNumber: container.delegateTo(PhoneController, 'verifyPhoneNumber'),
})
