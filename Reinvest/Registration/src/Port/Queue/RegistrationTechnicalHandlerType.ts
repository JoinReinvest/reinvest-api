import {ContainerInterface} from "Container/Container";
import {ProfileCompletedEventHandler} from "Registration/Port/Queue/EventHandler/ProfileCompletedEventHandler";
import {
    IndividualAccountOpenedEventHandler
} from "Registration/Port/Queue/EventHandler/IndividualAccountOpenedEventHandler";

export type RegistrationTechnicalHandlerType = {
    LegalProfileCompleted: ProfileCompletedEventHandler['handle'],
    IndividualAccountOpened: IndividualAccountOpenedEventHandler['handle'],
}


export const registrationTechnicalHandler = (container: ContainerInterface): RegistrationTechnicalHandlerType => ({
    LegalProfileCompleted: container.delegateTo(ProfileCompletedEventHandler, 'handle'),
    IndividualAccountOpened: container.delegateTo(IndividualAccountOpenedEventHandler, 'handle')
})
