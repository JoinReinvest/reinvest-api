import { getAvatarRemoveEvent, LegalEntityAvatarRemoved, LegalEntityDocumentRemoved } from 'LegalEntities/Domain/Events/DocumentEvents';
import { Address, AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { Company, CompanyName, CompanyNameInput, CompanyTypeInput } from 'LegalEntities/Domain/ValueObject/Company';
import { Avatar, AvatarInput, CompanyDocuments, DocumentSchema } from 'LegalEntities/Domain/ValueObject/Document';
import { EIN, SensitiveNumberSchema } from 'LegalEntities/Domain/ValueObject/SensitiveNumber';
import { CompanyStakeholders, Stakeholder, StakeholderSchema } from 'LegalEntities/Domain/ValueObject/Stakeholder';
import { ToObject } from 'LegalEntities/Domain/ValueObject/ToObject';
import { Uuid } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { AnnualRevenue, NumberOfEmployees, ValueRangeInput } from 'LegalEntities/Domain/ValueObject/ValueRange';
import { Industry, ValueStringInput } from 'LegalEntities/Domain/ValueObject/ValueString';

export enum CompanyAccountType {
  CORPORATE = 'CORPORATE',
  TRUST = 'TRUST',
}

export type CompanySchema = {
  accountId: string;
  accountType: CompanyAccountType;
  address: AddressInput;
  annualRevenue: ValueRangeInput;
  avatar: AvatarInput | null;
  companyDocuments: DocumentSchema[];
  companyName: CompanyNameInput;
  companyType: CompanyTypeInput;
  ein: SensitiveNumberSchema;
  einHash: string | null;
  industry: ValueStringInput;
  numberOfEmployees: ValueRangeInput;
  profileId: string;
  stakeholders: StakeholderSchema[];
};

export type CompanyOverviewSchema = {
  accountId: string;
  accountType: CompanyAccountType;
  avatar: AvatarInput | null;
  companyName: CompanyNameInput;
  profileId: string;
};

function getAccountLabel(accountType: CompanyAccountType, companyName: CompanyName | null): string {
  if (companyName) {
    return companyName.getLabel();
  }

  switch (accountType) {
    case CompanyAccountType.CORPORATE:
      return 'Corporate Account';
    case CompanyAccountType.TRUST:
      return 'Trust Account';
    default:
      return 'Company Account';
  }
}

function getAccountInitials(accountType: CompanyAccountType, companyName: CompanyName | null): string {
  if (companyName) {
    return companyName.getInitials();
  }

  return accountType.slice(0, 1).toUpperCase();
}

export class CompanyAccount {
  private profileId: string;
  private accountId: string;
  private companyName: CompanyName | null = null;
  private address: Address | null = null;
  private ein: EIN | null = null;
  private annualRevenue: AnnualRevenue | null = null;
  private numberOfEmployees: NumberOfEmployees | null = null;
  private industry: Industry | null = null;
  private companyType: Company | null = null;
  private avatar: Avatar | null = null;
  private documents: CompanyDocuments = new CompanyDocuments([]);
  private stakeholders: CompanyStakeholders = new CompanyStakeholders([]);
  private readonly accountType: CompanyAccountType;

  constructor(profileId: string, accountId: string, accountType: CompanyAccountType) {
    this.profileId = profileId;
    this.accountId = accountId;
    this.accountType = accountType;
  }

  private get(value: ToObject | null) {
    if (value === null) {
      return null;
    }

    return value.toObject();
  }

  toObject(): CompanySchema {
    return {
      accountId: this.accountId,
      profileId: this.profileId,
      companyName: this.get(this.companyName),
      address: this.get(this.address),
      ein: this.get(this.ein),
      annualRevenue: this.get(this.annualRevenue),
      numberOfEmployees: this.get(this.numberOfEmployees),
      industry: this.get(this.industry),
      companyType: this.get(this.companyType),
      avatar: this.get(this.avatar),
      companyDocuments: this.get(this.documents),
      stakeholders: this.get(this.stakeholders),
      accountType: this.accountType,
      einHash: this.ein?.getHash() ?? null,
    };
  }

  static create(companyData: CompanySchema): CompanyAccount {
    const {
      profileId,
      accountId,
      companyName,
      address,
      ein,
      annualRevenue,
      numberOfEmployees,
      industry,
      companyType,
      avatar,
      stakeholders,
      companyDocuments,
      accountType,
    } = companyData;
    const account = new CompanyAccount(profileId, accountId, accountType);

    if (companyName) {
      account.setCompanyName(CompanyName.create(companyName));
    }

    if (address) {
      account.setAddress(Address.create(address));
    }

    if (ein) {
      account.setEIN(EIN.create(ein));
    }

    if (annualRevenue) {
      account.setAnnualRevenue(AnnualRevenue.create(annualRevenue));
    }

    if (numberOfEmployees) {
      account.setNumberOfEmployees(NumberOfEmployees.create(numberOfEmployees));
    }

    if (industry) {
      account.setIndustry(Industry.create(industry));
    }

    if (companyType) {
      account.setCompanyType(Company.create(companyType));
    }

    if (avatar) {
      account.setAvatarDocument(Avatar.create(avatar));
    }

    account.setDocuments(CompanyDocuments.create(companyDocuments ?? []));
    account.setStakeholders(CompanyStakeholders.create(stakeholders ?? []));

    return account;
  }

  getId(): string {
    return this.accountId;
  }

  getAccountType(): string {
    return this.accountType;
  }

  getLabel(): string {
    return getAccountLabel(this.accountType, this.companyName);
  }

  getStakeholderById(id: string): Stakeholder | null {
    const stakeholder = this.stakeholders?.getStakeholderById(new Uuid(id));

    return stakeholder ?? null;
  }

  setCompanyName(companyName: CompanyName) {
    this.companyName = companyName;
  }

  setAvatarDocument(avatar: Avatar) {
    this.avatar = avatar;
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

  getInitials(): string {
    return getAccountInitials(this.accountType, this.companyName);
  }

  setAddress(address: Address) {
    this.address = address;
  }

  setEIN(ein: EIN) {
    this.ein = ein;
  }

  setAnnualRevenue(annualRevenue: AnnualRevenue) {
    this.annualRevenue = annualRevenue;
  }

  setNumberOfEmployees(numberOfEmployees: NumberOfEmployees) {
    this.numberOfEmployees = numberOfEmployees;
  }

  setIndustry(industry: Industry) {
    this.industry = industry;
  }

  setCompanyType(company: Company) {
    this.companyType = company;
  }

  setDocuments(documents: CompanyDocuments) {
    this.documents = documents;
  }

  addDocument(document: DocumentSchema) {
    this.documents?.addDocument(document);
  }

  removeDocument(document: DocumentSchema): LegalEntityDocumentRemoved | null {
    return this.documents?.removeDocument(document) ?? null;
  }

  setStakeholders(companyStakeholders: CompanyStakeholders) {
    this.stakeholders = companyStakeholders;
  }

  addStakeholder(stakeholder: Stakeholder) {
    this.stakeholders?.addStakeholder(stakeholder);
  }

  updateStakeholder(stakeholder: Stakeholder): LegalEntityDocumentRemoved[] {
    return this.stakeholders?.updateStakeholder(stakeholder) ?? [];
  }

  removeStakeholder(id: Uuid) {
    return this.stakeholders?.removeStakeholder(id);
  }

  getAvatar(): Avatar | null {
    return this.avatar;
  }
}

export class CompanyAccountOverview {
  private profileId: string;
  private accountId: string;
  private companyName: CompanyName | null = null;
  private avatar: Avatar | null = null;
  private readonly accountType: CompanyAccountType;

  constructor(profileId: string, accountId: string, accountType: CompanyAccountType) {
    this.profileId = profileId;
    this.accountId = accountId;
    this.accountType = accountType;
  }

  static create(companyData: CompanyOverviewSchema): CompanyAccountOverview {
    const { profileId, accountId, companyName, avatar, accountType } = companyData;
    const account = new CompanyAccountOverview(profileId, accountId, accountType);

    if (companyName) {
      account.setCompanyName(CompanyName.create(companyName));
    }

    if (avatar) {
      account.setAvatarDocument(Avatar.create(avatar));
    }

    return account;
  }

  getId(): string {
    return this.accountId;
  }

  getAccountType(): string {
    return this.accountType;
  }

  getLabel(): string {
    return getAccountLabel(this.accountType, this.companyName);
  }

  setCompanyName(companyName: CompanyName) {
    this.companyName = companyName;
  }

  setAvatarDocument(avatar: Avatar) {
    this.avatar = avatar;
  }

  getInitials(): string {
    return getAccountInitials(this.accountType, this.companyName);
  }

  getAvatar(): Avatar | null {
    return this.avatar;
  }
}
