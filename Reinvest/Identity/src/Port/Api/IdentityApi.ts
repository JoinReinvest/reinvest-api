import { ContainerInterface } from 'Container/Container';
import { BanController } from 'Identity/Port/Api/BanController';
import { IncentiveTokenController } from 'Identity/Port/Api/IncentiveTokenController';
import { PhoneController } from 'Identity/Port/Api/PhoneController';
import { ProfileController } from 'Identity/Port/Api/ProfileController';
import { ProfileHashController } from 'Identity/Port/Api/ProfileHashController';
import { UserController } from 'Identity/Port/Api/UserController';
import { UserRegistrationController } from 'Identity/Port/Api/UserRegistrationController';

export type IdentityApiType = {
  addBannedId: BanController['addBannedId'];
  getPhoneAndEmailData: ProfileController['getPhoneAndEmailData'];
  getProfile: ProfileController['getProfile'];
  getProfileByEmail: ProfileController['getProfileByEmail'];
  getProfileByProfileId: ProfileController['getProfileByProfileId'];
  getUserData: ProfileController['getUserData'];
  getUserInvitationLink: IncentiveTokenController['getUserInvitationLink'];
  getUserInviter: ProfileController['getUserInviter'];

  isIncentiveTokenValid: IncentiveTokenController['isIncentiveTokenValid'];
  isPhoneNumberCompleted: PhoneController['isPhoneNumberCompleted'];

  listUsers: UserController['listUsers'];

  profileIdDecrypt: ProfileHashController['decrypt'];
  profileIdEncrypt: ProfileHashController['encrypt'];
  registerUser: UserRegistrationController['registerUser'];

  removeBannedId: BanController['removeBannedId'];
  setPhoneNumber: PhoneController['setPhoneNumber'];

  setUserLabel: ProfileController['setUserLabel'];
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
  getPhoneAndEmailData: container.delegateTo(ProfileController, 'getPhoneAndEmailData'),
  getUserInviter: container.delegateTo(ProfileController, 'getUserInviter'),
  listUsers: container.delegateTo(UserController, 'listUsers'),
  getProfileByProfileId: container.delegateTo(ProfileController, 'getProfileByProfileId'),
  removeBannedId: container.delegateTo(BanController, 'removeBannedId'),
  getUserData: container.delegateTo(ProfileController, 'getUserData'),
  setUserLabel: container.delegateTo(ProfileController, 'setUserLabel'),
  profileIdEncrypt: container.delegateTo(ProfileHashController, 'encrypt'),
  profileIdDecrypt: container.delegateTo(ProfileHashController, 'decrypt'),
});
