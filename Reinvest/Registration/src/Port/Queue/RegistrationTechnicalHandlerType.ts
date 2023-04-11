import {ContainerInterface} from "Container/Container";
import {ProfileCompletedEventHandler} from "Registration/Port/Queue/EventHandler/ProfileCompletedEventHandler";
import {
    IndividualAccountOpenedEventHandler
} from "Registration/Port/Queue/EventHandler/IndividualAccountOpenedEventHandler";
import {CompanyAccountOpenedEventHandler} from "Registration/Port/Queue/EventHandler/CompanyAccountOpenedEventHandler";

export type RegistrationTechnicalHandlerType = {
    LegalProfileCompleted: ProfileCompletedEventHandler['handle'],
    IndividualAccountOpened: IndividualAccountOpenedEventHandler['handle'],
    CorporateAccountOpened: CompanyAccountOpenedEventHandler['handle'],
    TrustAccountOpened: CompanyAccountOpenedEventHandler['handle'],
}


export const registrationTechnicalHandler = (container: ContainerInterface): RegistrationTechnicalHandlerType => ({
    LegalProfileCompleted: container.delegateTo(ProfileCompletedEventHandler, 'handle'),
    IndividualAccountOpened: container.delegateTo(IndividualAccountOpenedEventHandler, 'handle'),
    CorporateAccountOpened: container.delegateTo(CompanyAccountOpenedEventHandler, 'handle'),
    TrustAccountOpened: container.delegateTo(CompanyAccountOpenedEventHandler, 'handle'),
})
