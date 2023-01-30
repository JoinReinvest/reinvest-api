import {PhoneController} from "Identity/Port/Api/PhoneController";
import {ContainerInterface} from "Container/Container";

export type IdentityApiType = {
    verifyPhoneNumber: PhoneController["verifyPhoneNumber"],
    setPhoneNumber: PhoneController["setPhoneNumber"],

    registerUser: Function,
    getProfile: Function
}

export const IdentityApi = (container: ContainerInterface): IdentityApiType => ({
    registerUser: (userId: string, profileId: string) => ({}),
    getProfile: (userId: string): string => '27fad77f-f160-44a8-8611-b19f6e76a253',

    setPhoneNumber: container.delegateTo(PhoneController, 'setPhoneNumber'),
    verifyPhoneNumber: container.delegateTo(PhoneController, 'verifyPhoneNumber'),
})
