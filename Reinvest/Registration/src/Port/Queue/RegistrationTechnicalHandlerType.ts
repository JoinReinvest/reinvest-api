import { ContainerInterface } from 'Container/Container';
import { BeneficiaryAccountOpenedEventHandler } from 'Registration/Port/Queue/EventHandler/BeneficiaryAccountOpenedEventHandler';
import { CompanyAccountOpenedEventHandler } from 'Registration/Port/Queue/EventHandler/CompanyAccountOpenedEventHandler';
import { IndividualAccountOpenedEventHandler } from 'Registration/Port/Queue/EventHandler/IndividualAccountOpenedEventHandler';
import { ProfileCompletedEventHandler } from 'Registration/Port/Queue/EventHandler/ProfileCompletedEventHandler';

export type RegistrationTechnicalHandlerType = {
  BeneficiaryAccountOpened: BeneficiaryAccountOpenedEventHandler['handle'];
  CorporateAccountOpened: CompanyAccountOpenedEventHandler['handle'];
  IndividualAccountOpened: IndividualAccountOpenedEventHandler['handle'];
  LegalProfileCompleted: ProfileCompletedEventHandler['handle'];
  TrustAccountOpened: CompanyAccountOpenedEventHandler['handle'];
};

export const registrationTechnicalHandler = (container: ContainerInterface): RegistrationTechnicalHandlerType => ({
  LegalProfileCompleted: container.delegateTo(ProfileCompletedEventHandler, 'handle'),
  IndividualAccountOpened: container.delegateTo(IndividualAccountOpenedEventHandler, 'handle'),
  CorporateAccountOpened: container.delegateTo(CompanyAccountOpenedEventHandler, 'handle'),
  TrustAccountOpened: container.delegateTo(CompanyAccountOpenedEventHandler, 'handle'),
  BeneficiaryAccountOpened: container.delegateTo(BeneficiaryAccountOpenedEventHandler, 'handle'),
});
