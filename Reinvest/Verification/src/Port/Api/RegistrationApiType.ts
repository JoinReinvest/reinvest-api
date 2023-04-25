import { ContainerInterface } from 'Container/Container';
import { VerifyAccount } from 'Verification/IntegrationLogic/UseCase/VerifyAccount';
import { AdminVerificationActions } from 'Verification/Port/Api/AdminVerificationActions';

export type VerificationApiType = {
  recoverVerification: AdminVerificationActions['recoverVerification'];
  verifyAccount: VerifyAccount['verify'];
};

export const verificationApi = (container: ContainerInterface): VerificationApiType => ({
  recoverVerification: container.delegateTo(AdminVerificationActions, 'recoverVerification'),
  verifyAccount: container.delegateTo(VerifyAccount, 'verify'),
});
