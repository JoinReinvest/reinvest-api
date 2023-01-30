import {ContainerInterface} from "Container/Container";

export type IdentityTechnicalHandlerType = {
    // completePerson: PeopleController["completePerson"],
    ProfileCreated: () => void,
}


export const IdentityTechnicalHandler = (container: ContainerInterface): IdentityTechnicalHandlerType => ({
    ProfileCreated: (): void => {
        console.log('profile created testss - identity')
    }
})
