import { ContainerInterface } from 'Container/Container';
import { BanController } from 'Identity/Port/Api/BanController';
import { IncentiveTokenController } from 'Identity/Port/Api/IncentiveTokenController';
import { PhoneController } from 'Identity/Port/Api/PhoneController';
import { ProfileController } from 'Identity/Port/Api/ProfileController';
import { ProfileHashController } from 'Identity/Port/Api/ProfileHashController'
import { UserRegistrationController } from 'Identity/Port/Api/UserRegistrationController';

export type IdentityApiType = {
  addBannedId: BanController['addBannedId'];
  getPhoneAndEmailData: ProfileController['getPhoneAndEmailData'];
  getProfile: ProfileController['getProfile'];
  getProfileByEmail: ProfileController['getProfileByEmail'];
  getUserInvitationLink: IncentiveTokenController['getUserInvitationLink'];

  getUserInviter: ProfileController['getUserInviter'];
  isIncentiveTokenValid: IncentiveTokenController['isIncentiveTokenValid'];

  isPhoneNumberCompleted: PhoneController['isPhoneNumberCompleted'];

  registerUser: UserRegistrationController['registerUser'];
  setPhoneNumber: PhoneController['setPhoneNumber'];
  updateEmailAddress: ProfileController['updateEmailAddress'];

  verifyPhoneNumber: PhoneController['verifyPhoneNumber'];
  profileIdEncrypt: ProfileHashController['encrypt']
  profileIdDecrypt: ProfileHashController['decrypt']
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
  getPhoneAndEmailData: container.delegateTo(ProfileController, 'getPhoneAndEmailData'),
  getUserInviter: container.delegateTo(ProfileController, 'getUserInviter'),
  profileIdEncrypt: container.delegateTo(ProfileHashController, 'encrypt'),
  profileIdDecrypt: container.delegateTo(ProfileHashController, 'decrypt'),
});
