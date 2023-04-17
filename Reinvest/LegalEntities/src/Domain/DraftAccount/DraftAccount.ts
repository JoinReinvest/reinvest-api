import { CompanyAccount, CompanyAccountType } from 'LegalEntities/Domain/Accounts/CompanyAccount';
import { IndividualAccount } from 'LegalEntities/Domain/Accounts/IndividualAccount';
import { getAvatarRemoveEvent, LegalEntityAvatarRemoved, LegalEntityDocumentRemoved } from 'LegalEntities/Domain/Events/DocumentEvents';
import { Address, AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { Company, CompanyName, CompanyNameInput, CompanyTypeInput } from 'LegalEntities/Domain/ValueObject/Company';
import { Avatar, AvatarInput, CompanyDocuments, DocumentSchema } from 'LegalEntities/Domain/ValueObject/Document';
import { Employer, EmployerInput } from 'LegalEntities/Domain/ValueObject/Employer';
import { EmploymentStatus, EmploymentStatusInput } from 'LegalEntities/Domain/ValueObject/EmploymentStatus';
import { EIN, SensitiveNumberSchema } from 'LegalEntities/Domain/ValueObject/SensitiveNumber';
import { CompanyStakeholders, Stakeholder, StakeholderSchema } from 'LegalEntities/Domain/ValueObject/Stakeholder';
import { ToObject } from 'LegalEntities/Domain/ValueObject/ToObject';
import { Uuid } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { AnnualRevenue, NetIncome, NetWorth, NumberOfEmployees, ValueRangeInput } from 'LegalEntities/Domain/ValueObject/ValueRange';
import { Industry, ValueStringInput } from 'LegalEntities/Domain/ValueObject/ValueString';

export enum DraftAccountState {
  ACTIVE = 'ACTIVE',
  OPENED = 'OPENED',
  CANCELED = 'CANCELED',
}

export enum DraftAccountType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
  TRUST = 'TRUST',
}

export type CompanyDraftAccountType = Exclude<DraftAccountType, DraftAccountType.INDIVIDUAL>;

export type IndividualDraftAccountSchema = {
  avatar: AvatarInput | null;
  employer: EmployerInput | null;
  employmentStatus: EmploymentStatusInput | null;
  netIncome: ValueRangeInput | null;
  netWorth: ValueRangeInput | null;
};

export type CompanyDraftAccountSchema = {
  address: AddressInput;
  annualRevenue: ValueRangeInput;
  avatar: AvatarInput | null;
  companyDocuments: DocumentSchema[];
  companyName: CompanyNameInput;
  companyType: CompanyTypeInput;
  ein: SensitiveNumberSchema;
  industry: ValueStringInput;
  numberOfEmployees: ValueRangeInput;
  stakeholders: StakeholderSchema[];
};

export type DraftInput = {
  accountType: DraftAccountType;
  data: unknown;
  draftId: string;
  profileId: string;
  state: DraftAccountState;
};

export type IndividualDraftInput = DraftInput & {
  data: IndividualDraftAccountSchema;
};

export type CompanyDraftInput = DraftInput & {
  data: CompanyDraftAccountSchema;
};

export abstract class DraftAccount {
  protected profileId: string;
  protected draftId: string;
  protected state: DraftAccountState;
  protected accountType: DraftAccountType;
  protected avatar: Avatar | null = null;

  constructor(profileId: string, draftId: string, state: DraftAccountState, accountType: DraftAccountType) {
    this.draftId = draftId;
    this.state = state;
    this.profileId = profileId;
    this.accountType = accountType;
  }

  static create(draft: DraftInput): DraftAccount {
    const { profileId, draftId, state, accountType, data } = draft;
    switch (accountType) {
      case DraftAccountType.INDIVIDUAL:
        return IndividualDraftAccount.createIndividual(profileId, draftId, state, data as IndividualDraftAccountSchema);
      case DraftAccountType.CORPORATE:
        return CorporateDraftAccount.createCorporate(profileId, draftId, state, data as CompanyDraftAccountSchema);
      case DraftAccountType.TRUST:
        return TrustDraftAccount.createTrust(profileId, draftId, state, data as CompanyDraftAccountSchema);
      default:
        throw new Error('Draft type does not exist');
    }
  }

  protected get(value: ToObject | null) {
    if (value === null) {
      return null;
    }

    return value.toObject();
  }

  toObject(): DraftInput {
    return {
      profileId: this.profileId,
      draftId: this.draftId,
      state: this.state,
      accountType: this.accountType,
      data: {} as IndividualDraftAccountSchema | CompanyDraftAccountSchema,
    };
  }

  getInitials(): string {
    return this.accountType.charAt(0).toUpperCase();
  }

  isIndividual(): boolean {
    return this.accountType === DraftAccountType.INDIVIDUAL;
  }

  isCorporate(): boolean {
    return this.accountType === DraftAccountType.CORPORATE;
  }

  isTrust(): boolean {
    return this.accountType === DraftAccountType.TRUST;
  }

  isActive() {
    return this.state === DraftAccountState.ACTIVE;
  }

  isType(accountType: DraftAccountType) {
    return this.accountType === accountType;
  }

  setAvatar(avatar: Avatar) {
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

  removeAvatar(): LegalEntityAvatarRemoved | null {
    if (this.avatar === null) {
      return null;
    }

    const event = getAvatarRemoveEvent({ ...this.avatar.toObject() });
    this.avatar = null;

    return event;
  }

  getAvatar(): Avatar | null {
    return this.avatar;
  }

  abstract verifyCompletion(): boolean;

  abstract transformIntoAccount(): IndividualAccount | CompanyAccount;

  removeAllDocuments(): LegalEntityDocumentRemoved[] {
    return [];
  }

  removeAllStakeholders(): LegalEntityDocumentRemoved[] {
    return [];
  }
}

export class IndividualDraftAccount extends DraftAccount {
  private employmentStatus: EmploymentStatus | null = null;
  private employer: Employer | null = null;
  private netWorth: NetWorth | null = null;
  private netIncome: NetIncome | null = null;

  constructor(profileId: string, draftId: string, state: DraftAccountState) {
    super(profileId, draftId, state, DraftAccountType.INDIVIDUAL);
  }

  setEmploymentStatus(employmentStatus: EmploymentStatus) {
    this.employmentStatus = employmentStatus;
  }

  static createIndividual(profileId: string, draftId: string, state: DraftAccountState, data: IndividualDraftAccountSchema): IndividualDraftAccount {
    const draftAccount = new IndividualDraftAccount(profileId, draftId, state);

    if (!data) {
      return draftAccount;
    }

    if (data.employmentStatus) {
      draftAccount.setEmploymentStatus(EmploymentStatus.create(data.employmentStatus));
    }

    if (data.avatar) {
      draftAccount.setAvatar(Avatar.create(data.avatar));
    }

    if (data.employer) {
      draftAccount.setEmployer(Employer.create(data.employer));
    }

    if (data.netWorth) {
      draftAccount.setNetWorth(NetWorth.create(data.netWorth));
    }

    if (data.netIncome) {
      draftAccount.setNetIncome(NetIncome.create(data.netIncome));
    }

    return draftAccount;
  }

  toObject(): IndividualDraftInput {
    return {
      ...super.toObject(),
      data: {
        employmentStatus: this.get(this.employmentStatus),
        employer: this.get(this.employer),
        netWorth: this.get(this.netWorth),
        netIncome: this.get(this.netIncome),
        avatar: this.get(this.avatar),
      },
    };
  }

  transformIntoAccount(): IndividualAccount {
    const {
      profileId,
      draftId: accountId,
      data: { employmentStatus, employer, netIncome, netWorth, avatar },
    } = this.toObject();

    return IndividualAccount.create({
      profileId,
      accountId,
      employmentStatus,
      employer,
      netWorth,
      netIncome,
      avatar,
    });
  }

  verifyCompletion(): boolean {
    if (this.netWorth === null || this.netIncome === null || this.employmentStatus === null) {
      return false;
    }

    return !(this.employmentStatus.isEmployed() && this.employer === null);
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

  getInitials(): string {
    return super.getInitials();
  }
}

export class CompanyDraftAccount extends DraftAccount {
  private companyName: CompanyName | null = null;
  private address: Address | null = null;
  private ein: EIN | null = null;
  private annualRevenue: AnnualRevenue | null = null;
  private numberOfEmployees: NumberOfEmployees | null = null;
  private industry: Industry | null = null;
  private companyType: Company | null = null;
  private documents: CompanyDocuments = new CompanyDocuments([]);
  private stakeholders: CompanyStakeholders = new CompanyStakeholders([]);

  static setCompanyData(draftAccount: CompanyDraftAccount, data: CompanyDraftAccountSchema): void {
    if (!data) {
      return;
    }

    if (data.companyName) {
      draftAccount.setCompanyName(CompanyName.create(data.companyName));
    }

    if (data.address) {
      draftAccount.setAddress(Address.create(data.address));
    }

    if (data.ein) {
      draftAccount.setEIN(EIN.create(data.ein));
    }

    if (data.annualRevenue) {
      draftAccount.setAnnualRevenue(AnnualRevenue.create(data.annualRevenue));
    }

    if (data.numberOfEmployees) {
      draftAccount.setNumberOfEmployees(NumberOfEmployees.create(data.numberOfEmployees));
    }

    if (data.industry) {
      draftAccount.setIndustry(Industry.create(data.industry));
    }

    if (data.companyType) {
      draftAccount.setCompanyType(Company.create(data.companyType));
    }

    if (data.avatar) {
      draftAccount.setAvatar(Avatar.create(data.avatar));
    }

    draftAccount.setDocuments(CompanyDocuments.create(data.companyDocuments ?? []));
    draftAccount.setStakeholders(CompanyStakeholders.create(data.stakeholders ?? []));
  }

  getInitials(): string {
    return this.companyName ? this.companyName.getInitials() : super.getInitials();
  }

  toObject(): CompanyDraftInput {
    return {
      ...super.toObject(),
      data: {
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
      },
    };
  }

  transformIntoAccount(): CompanyAccount {
    const {
      profileId,
      draftId: accountId,
      data: { companyName, address, ein, annualRevenue, numberOfEmployees, industry, companyType, avatar, stakeholders, companyDocuments },
    } = this.toObject();
    const accountType = this.isCorporate() ? CompanyAccountType.CORPORATE : CompanyAccountType.TRUST;

    return CompanyAccount.create({
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
      einHash: this.ein?.getHash() ?? '',
    });
  }

  setCompanyName(companyName: CompanyName) {
    this.companyName = companyName;
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

  removeDocument(document: DocumentSchema) {
    this.documents?.removeDocument(document);
  }

  removeAllDocuments(): LegalEntityDocumentRemoved[] {
    const events = this.documents?.removeAllDocuments() ?? [];
    this.documents = new CompanyDocuments([]);

    return events;
  }

  setStakeholders(companyStakeholders: CompanyStakeholders) {
    this.stakeholders = companyStakeholders;
  }

  addStakeholder(stakeholder: Stakeholder): LegalEntityDocumentRemoved[] {
    return this.stakeholders?.addStakeholder(stakeholder) ?? [];
  }

  removeStakeholder(id: Uuid): LegalEntityDocumentRemoved[] {
    return this.stakeholders?.removeStakeholder(id) ?? [];
  }

  removeAllStakeholders(): LegalEntityDocumentRemoved[] {
    const events = this.stakeholders?.removeAllStakeholders() ?? [];
    this.stakeholders = new CompanyStakeholders([]);

    return events;
  }

  getEIN(): EIN | null {
    return this.ein;
  }

  isIrrevocableTrust(): boolean {
    return this.companyType?.isIrrevocableTrust() ?? false;
  }

  verifyCompletion(): boolean {
    if (
      this.companyName === null ||
      this.address === null ||
      this.annualRevenue === null ||
      this.numberOfEmployees === null ||
      this.industry === null ||
      this.companyType === null ||
      this.documents.isEmpty()
    ) {
      return false;
    }

    return !(!this.isIrrevocableTrust() && this.ein === null);
  }
}

export class CorporateDraftAccount extends CompanyDraftAccount {
  constructor(profileId: string, draftId: string, state: DraftAccountState) {
    super(profileId, draftId, state, DraftAccountType.CORPORATE);
  }

  static createCorporate(profileId: string, draftId: string, state: DraftAccountState, data: CompanyDraftAccountSchema): CorporateDraftAccount {
    const corporateDraftAccount = new CorporateDraftAccount(profileId, draftId, state);
    super.setCompanyData(corporateDraftAccount, data);

    return corporateDraftAccount;
  }
}

export class TrustDraftAccount extends CompanyDraftAccount {
  constructor(profileId: string, draftId: string, state: DraftAccountState) {
    super(profileId, draftId, state, DraftAccountType.TRUST);
  }

  static createTrust(profileId: string, draftId: string, state: DraftAccountState, data: CompanyDraftAccountSchema): TrustDraftAccount {
    const trustDraftAccount = new TrustDraftAccount(profileId, draftId, state);
    super.setCompanyData(trustDraftAccount, data);

    return trustDraftAccount;
  }
}
