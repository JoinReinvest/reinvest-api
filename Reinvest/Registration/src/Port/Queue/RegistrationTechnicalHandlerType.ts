import {ContainerInterface} from "Container/Container";
import {ProfileCompletedEventHandler} from "Registration/Port/Queue/EventHandler/ProfileCompletedEventHandler";

export type RegistrationTechnicalHandlerType = {
    LegalProfileCompleted: ProfileCompletedEventHandler['handle'],
}


export const registrationTechnicalHandler = (container: ContainerInterface): RegistrationTechnicalHandlerType => ({
    LegalProfileCompleted: container.delegateTo(ProfileCompletedEventHandler, 'handle')
})
