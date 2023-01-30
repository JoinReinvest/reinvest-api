import {ContainerInterface} from "Container/Container";


export type LegalEntitiesTechnicalHandlerType = {
    // completePerson: PeopleController["completePerson"],
    ProfileCreated: () => void,
}


export const LegalEntitiesTechnicalHandler = (container: ContainerInterface): LegalEntitiesTechnicalHandlerType => ({
    // completePerson: container.getClass<PeopleController>(PeopleController).completePerson,
    ProfileCreated: (): void => {
        console.log('profile created testss')
    }
})
