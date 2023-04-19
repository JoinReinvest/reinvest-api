import { ContainerInterface } from 'Container/Container';

export type VerificationTechnicalHandlerType = {
  // CorporateAccountOpened: CompanyAccountOpenedEventHandler['handle'];
  // IndividualAccountOpened: IndividualAccountOpenedEventHandler['handle'];
  // LegalProfileCompleted: ProfileCompletedEventHandler['handle'];
  // TrustAccountOpened: CompanyAccountOpenedEventHandler['handle'];
};

export const verificationTechnicalHandler = (container: ContainerInterface): VerificationTechnicalHandlerType => ({
  // LegalProfileCompleted: container.delegateTo(ProfileCompletedEventHandler, 'handle'),
  // IndividualAccountOpened: container.delegateTo(IndividualAccountOpenedEventHandler, 'handle'),
  // CorporateAccountOpened: container.delegateTo(CompanyAccountOpenedEventHandler, 'handle'),
  // TrustAccountOpened: container.delegateTo(CompanyAccountOpenedEventHandler, 'handle'),
});
