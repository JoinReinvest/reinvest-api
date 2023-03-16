import {ContainerInterface} from "Container/Container";

export type RegistrationTechnicalHandlerType = {
    ProfileCreated: () => void,
}


export const registrationTechnicalHandler = (container: ContainerInterface): RegistrationTechnicalHandlerType => ({
    ProfileCreated: (): void => {
        console.log('profile created testss - identity')
    }
})
