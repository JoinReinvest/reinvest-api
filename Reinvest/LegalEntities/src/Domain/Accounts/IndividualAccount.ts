import { Avatar, AvatarInput } from 'LegalEntities/Domain/ValueObject/Document';
import { Employer, EmployerInput } from 'LegalEntities/Domain/ValueObject/Employer';
import { EmploymentStatus, EmploymentStatusInput } from 'LegalEntities/Domain/ValueObject/EmploymentStatus';
import { PersonalName, PersonalNameInput } from 'LegalEntities/Domain/ValueObject/PersonalName';
import { ToObject } from 'LegalEntities/Domain/ValueObject/ToObject';
import { NetIncome, NetWorth, ValueRangeInput } from 'LegalEntities/Domain/ValueObject/ValueRange';

const INDIVIDUAL_ACCOUNT_LABEL: string = 'Individual account';

export type IndividualSchema = {
  accountId: string;
  avatar: AvatarInput | null;
  employer: EmployerInput | null;
  employmentStatus: EmploymentStatusInput | null;
  netIncome: ValueRangeInput | null;
  netWorth: ValueRangeInput | null;
  profileId: string;
  name?: PersonalNameInput | null;
};

export type IndividualOverviewSchema = {
  accountId: string;
  avatar: AvatarInput | null;
  profileId: string;
  name?: PersonalNameInput | null;
};

export class IndividualAccount {
  private profileId: string;
  private accountId: string;
  private employmentStatus: EmploymentStatus | null = null;
  private employer: Employer | null = null;
  private netWorth: NetWorth | null = null;
  private netIncome: NetIncome | null = null;
  private avatar: Avatar | null = null;
  private name: PersonalName | null = null;

  constructor(profileId: string, accountId: string) {
    this.profileId = profileId;
    this.accountId = accountId;
  }

  private get(value: ToObject | null) {
    if (value === null) {
      return null;
    }

    return value.toObject();
  }

  toObject(): IndividualSchema {
    return {
      accountId: this.accountId,
      profileId: this.profileId,
      employmentStatus: this.get(this.employmentStatus),
      employer: this.get(this.employer),
      netWorth: this.get(this.netWorth),
      netIncome: this.get(this.netIncome),
      avatar: this.get(this.avatar),
    };
  }

  static create(individualData: IndividualSchema): IndividualAccount {
    const { profileId, accountId, employmentStatus, employer, netIncome, netWorth, avatar } = individualData;
    const account = new IndividualAccount(profileId, accountId);

    if (employmentStatus) {
      account.setEmploymentStatus(EmploymentStatus.create(employmentStatus as EmploymentStatusInput));
    }

    if (avatar) {
      account.setAvatarDocument(Avatar.create(avatar as AvatarInput));
    }

    if (employer) {
      account.setEmployer(Employer.create(employer as EmployerInput));
    }

    if (netWorth) {
      account.setNetWorth(NetWorth.create(netWorth as ValueRangeInput));
    }

    if (netIncome) {
      account.setNetIncome(NetIncome.create(netIncome as ValueRangeInput));
    }

    if (individualData.name) {
      account.setName(PersonalName.create(individualData.name as PersonalNameInput));
    }

    return account;
  }

  getId(): string {
    return this.accountId;
  }

  setEmploymentStatus(employmentStatus: EmploymentStatus) {
    this.employmentStatus = employmentStatus;
  }

  setAvatarDocument(avatar: Avatar) {
    this.avatar = avatar;
  }

  setEmployer(employer: Employer) {
    this.employer = employer;
  }

  setNetWorth(netWorth: NetWorth) {
    this.netWorth = netWorth;
  }

  setNetIncome(netIncome: NetIncome) {
    this.netIncome = netIncome;
  }

  setName(personalName: PersonalName) {
    this.name = personalName;
  }

  getInitials(): string {
    if (this.name) {
      return this.name.getInitials();
    }

    return 'I';
  }

  getAvatar(): Avatar | null {
    return this.avatar;
  }

  getLabel(): string {
    if (this.name) {
      return this.name.getLabel();
    }

    return INDIVIDUAL_ACCOUNT_LABEL;
  }
}

export class IndividualAccountOverview {
  private profileId: string;
  private accountId: string;
  private avatar: Avatar | null = null;
  private name: PersonalName | null = null;

  constructor(profileId: string, accountId: string) {
    this.profileId = profileId;
    this.accountId = accountId;
  }

  static create(individualData: IndividualOverviewSchema): IndividualAccountOverview {
    const { profileId, accountId, avatar } = individualData;
    const account = new IndividualAccountOverview(profileId, accountId);

    if (avatar) {
      account.setAvatar(Avatar.create(avatar as AvatarInput));
    }

    if (individualData.name) {
      account.setName(PersonalName.create(individualData.name as PersonalNameInput));
    }

    return account;
  }

  getId(): string {
    return this.accountId;
  }

  setAvatar(avatar: Avatar) {
    this.avatar = avatar;
  }

  setName(personalName: PersonalName) {
    this.name = personalName;
  }

  getInitials(): string {
    if (this.name) {
      return this.name.getInitials();
    }

    return 'I';
  }

  getAvatar(): Avatar | null {
    return this.avatar;
  }

  getLabel(): string {
    if (this.name) {
      return this.name.getLabel();
    }

    return INDIVIDUAL_ACCOUNT_LABEL;
  }
}
