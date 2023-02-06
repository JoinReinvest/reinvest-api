import {ContainerInterface} from "Container/Container";

export type IdentityTechnicalHandlerType = {
    ProfileCreated: () => void,
}


export const identityTechnicalHandler = (container: ContainerInterface): IdentityTechnicalHandlerType => ({
    ProfileCreated: (): void => {
        console.log('profile created testss - identity')
    }
})
