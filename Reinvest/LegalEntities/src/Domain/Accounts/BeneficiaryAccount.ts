import { AccountType } from 'LegalEntities/Domain/AccountType';
import { getAvatarRemoveEvent, LegalEntityAvatarRemoved } from 'LegalEntities/Domain/Events/DocumentEvents';
import { Avatar, AvatarInput } from 'LegalEntities/Domain/ValueObject/Document';
import { ToObject } from 'LegalEntities/Domain/ValueObject/ToObject';

export type BeneficiaryName = {
  firstName: string;
  lastName: string;
};

export type BeneficiarySchema = {
  accountId: string;
  avatar: AvatarInput | null;
  individualId: string;
  isArchived: boolean;
  name: BeneficiaryName;
  profileId: string;
  label?: string;
};

export type BeneficiaryCompanyOverviewSchema = {
  accountId: string;
  accountType: AccountType.BENEFICIARY;
  avatar: AvatarInput | null;
  label: string;
};

export class BeneficiaryAccount {
  private profileId: string;
  private individualId: string;
  private accountId: string;
  private name: BeneficiaryName;
  private avatar: Avatar | null = null;
  private isArchived: boolean = false;

  constructor(profileId: string, accountId: string, individualId: string, name: BeneficiaryName) {
    this.profileId = profileId;
    this.accountId = accountId;
    this.individualId = individualId;
    this.name = name;
  }

  static create(beneficiaryData: BeneficiarySchema): BeneficiaryAccount {
    const { profileId, accountId, individualId, name, avatar } = beneficiaryData;
    const account = new BeneficiaryAccount(profileId, accountId, individualId, name);

    if (avatar) {
      account.setAvatarDocument(Avatar.create(avatar));
    }

    if (beneficiaryData.isArchived) {
      account.archive();
    }

    return account;
  }

  toObject(): BeneficiarySchema {
    return {
      accountId: this.accountId,
      profileId: this.profileId,
      individualId: this.individualId,
      isArchived: this.isArchived,
      name: this.name,
      avatar: this.get(this.avatar),
      label: this.getLabel(),
    };
  }

  setAvatarDocument(avatar: Avatar) {
    this.avatar = avatar;
  }

  setName(name: BeneficiaryName) {
    this.name = name;
  }

  replaceAvatar(avatar: Avatar): LegalEntityAvatarRemoved | null {
    if (this.avatar !== null && !this.avatar.isTheSame(avatar)) {
      const event = getAvatarRemoveEvent({ ...this.avatar.toObject() });
      this.avatar = avatar;

      return event;
    }

    this.avatar = avatar;

    return null;
  }

  getAvatar(): Avatar | null {
    return this.avatar;
  }

  getInitials(): string {
    return `${this.name.firstName[0]}${this.name.lastName[0]}`;
  }

  getParentAccountId() {
    return this.individualId;
  }

  private getLabel(): string {
    return `${this.name.firstName} ${this.name.lastName}`;
  }

  private get(value: ToObject | null) {
    if (value === null) {
      return null;
    }

    return value.toObject();
  }

  archive(): void {
    this.isArchived = true;
  }
}
