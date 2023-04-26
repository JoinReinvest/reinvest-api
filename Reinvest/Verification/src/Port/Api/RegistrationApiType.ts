import { ContainerInterface } from 'Container/Container';
import { VerifyAccount } from 'Verification/IntegrationLogic/UseCase/VerifyAccount';
import { AdminVerificationActions } from 'Verification/Port/Api/AdminVerificationActions';
import { UserVerificationActions } from 'Verification/Port/Api/UserVerificationActions';

export type VerificationApiType = {
  canObjectBeUpdated: UserVerificationActions['canObjectBeUpdated'];
  notifyAboutUpdate: UserVerificationActions['notifyAboutUpdate'];
  recoverVerification: AdminVerificationActions['recoverVerification'];
  verifyAccount: VerifyAccount['verify'];
};

export const verificationApi = (container: ContainerInterface): VerificationApiType => ({
  canObjectBeUpdated: container.delegateTo(UserVerificationActions, 'canObjectBeUpdated'),
  notifyAboutUpdate: container.delegateTo(UserVerificationActions, 'notifyAboutUpdate'),
  recoverVerification: container.delegateTo(AdminVerificationActions, 'recoverVerification'),
  verifyAccount: container.delegateTo(VerifyAccount, 'verify'),
});
