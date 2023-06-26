import { ContainerInterface } from 'Container/Container';
import { BanController } from 'Identity/Port/Api/BanController';
import { IncentiveTokenController } from 'Identity/Port/Api/IncentiveTokenController';
import { PhoneController } from 'Identity/Port/Api/PhoneController';
import { ProfileController } from 'Identity/Port/Api/ProfileController';
import { UserRegistrationController } from 'Identity/Port/Api/UserRegistrationController';

export type IdentityApiType = {
  addBannedId: BanController['addBannedId'];
  getProfile: ProfileController['getProfile'];
  getProfileByEmail: ProfileController['getProfileByEmail'];
  getUserInvitationLink: IncentiveTokenController['getUserInvitationLink'];

  isIncentiveTokenValid: IncentiveTokenController['isIncentiveTokenValid'];
  isPhoneNumberCompleted: PhoneController['isPhoneNumberCompleted'];

  registerUser: UserRegistrationController['registerUser'];

  setPhoneNumber: PhoneController['setPhoneNumber'];
  updateEmailAddress: ProfileController['updateEmailAddress'];
  verifyPhoneNumber: PhoneController['verifyPhoneNumber'];
};

export const identityApi = (container: ContainerInterface): IdentityApiType => ({
  registerUser: container.delegateTo(UserRegistrationController, 'registerUser'),

  getProfile: container.delegateTo(ProfileController, 'getProfile'),
  updateEmailAddress: container.delegateTo(ProfileController, 'updateEmailAddress'),
  isIncentiveTokenValid: container.delegateTo(IncentiveTokenController, 'isIncentiveTokenValid'),
  getUserInvitationLink: container.delegateTo(IncentiveTokenController, 'getUserInvitationLink'),

  setPhoneNumber: container.delegateTo(PhoneController, 'setPhoneNumber'),
  verifyPhoneNumber: container.delegateTo(PhoneController, 'verifyPhoneNumber'),
  isPhoneNumberCompleted: container.delegateTo(PhoneController, 'isPhoneNumberCompleted'),
  getProfileByEmail: container.delegateTo(ProfileController, 'getProfileByEmail'),
  addBannedId: container.delegateTo(BanController, 'addBannedId'),
});
