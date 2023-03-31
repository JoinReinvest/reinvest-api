import { ContainerInterface } from 'Container/Container';
import { IndividualAccountOpenedEventHandler } from 'Registration/Port/Queue/EventHandler/IndividualAccountOpenedEventHandler';
import { ProfileCompletedEventHandler } from 'Registration/Port/Queue/EventHandler/ProfileCompletedEventHandler';

export type RegistrationTechnicalHandlerType = {
  IndividualAccountOpened: IndividualAccountOpenedEventHandler['handle'];
  LegalProfileCompleted: ProfileCompletedEventHandler['handle'];
};

export const registrationTechnicalHandler = (container: ContainerInterface): RegistrationTechnicalHandlerType => ({
  LegalProfileCompleted: container.delegateTo(ProfileCompletedEventHandler, 'handle'),
  IndividualAccountOpened: container.delegateTo(IndividualAccountOpenedEventHandler, 'handle'),
});
