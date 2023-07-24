import { UUID } from 'HKEKTypes/Generics';
import { AccountType } from 'InvestmentAccounts/Domain/ProfileAggregate/AccountType';
import {
  BeneficiaryAccountOpened,
  BeneficiaryAccountRemoved,
  CorporateAccountOpened,
  IndividualAccountOpened,
  ProfileCreated,
  TrustAccountOpened,
} from 'InvestmentAccounts/Domain/ProfileAggregate/ProfileEvents';
import { ProfileException } from 'InvestmentAccounts/Domain/ProfileAggregate/ProfileException';
import { SimpleAggregate } from 'SimpleAggregator/SimpleAggregate';
import { AggregateState, DomainEvent } from 'SimpleAggregator/Types';

const MAX_NUMBER_OF_TRUSTS = 3;
const MAX_NUMBER_OF_CORPORATES = 3;
const MAX_NUMBER_OF_BENEFICIARIES = 3;

export const ProfileAggregateName = 'Profile';
export type ProfileState = AggregateState & {
  kind: 'Profile';
  state?: {
    beneficiaryAccountIds: [string];
    corporateAccountIds: [string];
    individualAccountId: null | string;
    trustAccountIds: [string];
  };
};

class Profile extends SimpleAggregate {
  // @ts-ignore
  protected aggregate: ProfileState;

  public static create(profileId: string) {
    return Profile.createAggregate(ProfileAggregateName, profileId);
  }

  public initialize(): ProfileCreated {
    const profileCreated = <ProfileCreated>{
      id: this.getId(),
      kind: 'ProfileCreated',
      data: {
        individualAccountId: null,
        beneficiaryAccountIds: [],
        corporateAccountIds: [],
        trustAccountIds: [],
      },
    };

    return this.apply(profileCreated);
  }

  public openIndividualAccount(accountId: string) {
    if (!this.canOpenIndividualAccount()) {
      const individualAccountId = this.getState('individualAccountId');
      ProfileException.throw(individualAccountId === accountId ? 'THE_ACCOUNT_ALREADY_OPENED' : 'CANNOT_OPEN_ACCOUNT');
    }

    const event = <IndividualAccountOpened>{
      id: this.getId(),
      kind: 'IndividualAccountOpened',
      data: {
        individualAccountId: accountId,
      },
    };

    return this.apply(event);
  }

  openCorporateAccount(accountId: string) {
    const corporateAccountIds = this.getState('corporateAccountIds', []);
    const isAlreadyOpened = corporateAccountIds.includes(accountId);

    if (isAlreadyOpened) {
      ProfileException.throw('THE_ACCOUNT_ALREADY_OPENED');
    }

    if (!this.canOpenCorporateAccount()) {
      ProfileException.throw('CANNOT_OPEN_ACCOUNT');
    }

    const event = <CorporateAccountOpened>{
      id: this.getId(),
      kind: 'CorporateAccountOpened',
      data: {
        corporateAccountId: accountId,
      },
    };

    return this.apply(event);
  }

  openTrustAccount(accountId: string) {
    const trustAccountIds = this.getState('trustAccountIds', []);
    const isAlreadyOpened = trustAccountIds.includes(accountId);

    if (isAlreadyOpened) {
      ProfileException.throw('THE_ACCOUNT_ALREADY_OPENED');
    }

    if (!this.canOpenTrustAccount()) {
      ProfileException.throw('CANNOT_OPEN_ACCOUNT');
    }

    const event = <TrustAccountOpened>{
      id: this.getId(),
      kind: 'TrustAccountOpened',
      data: {
        trustAccountId: accountId,
      },
    };

    return this.apply(event);
  }

  openBeneficiaryAccount(accountId: string) {
    const beneficiaryAccountIds = this.getState('beneficiaryAccountIds', []);
    const isAlreadyOpened = beneficiaryAccountIds.includes(accountId);

    if (isAlreadyOpened) {
      ProfileException.throw('THE_ACCOUNT_ALREADY_OPENED');
    }

    if (!this.canOpenBeneficiaryAccount()) {
      ProfileException.throw('CANNOT_OPEN_ACCOUNT');
    }

    const event = <BeneficiaryAccountOpened>{
      id: this.getId(),
      kind: 'BeneficiaryAccountOpened',
      data: {
        beneficiaryAccountId: accountId,
      },
    };

    return this.apply(event);
  }

  listAccountTypesUserCanOpen(): AccountType[] {
    const availableAccountTypes = [];

    if (this.canOpenIndividualAccount()) {
      availableAccountTypes.push(AccountType.INDIVIDUAL);
    }

    if (this.canOpenBeneficiaryAccount()) {
      availableAccountTypes.push(AccountType.BENEFICIARY);
    }

    if (this.canOpenCorporateAccount()) {
      availableAccountTypes.push(AccountType.CORPORATE);
    }

    if (this.canOpenTrustAccount()) {
      availableAccountTypes.push(AccountType.TRUST);
    }

    return availableAccountTypes;
  }

  apply<Event extends DomainEvent>(event: Event) {
    switch (event.kind) {
      case 'CorporateAccountOpened':
        const corporateAccountIds = [...this.getState('corporateAccountIds', [])];
        corporateAccountIds.push(event.data.corporateAccountId);
        this.setState('corporateAccountIds', corporateAccountIds);
        break;
      case 'TrustAccountOpened':
        const trustAccountIds = [...this.getState('trustAccountIds', [])];
        trustAccountIds.push(event.data.trustAccountId);
        this.setState('trustAccountIds', trustAccountIds);
        break;
      case 'BeneficiaryAccountOpened':
        const beneficiaryAccountIds = [...this.getState('beneficiaryAccountIds', [])];
        beneficiaryAccountIds.push(event.data.beneficiaryAccountId);
        this.setState('beneficiaryAccountIds', beneficiaryAccountIds);
        break;
      case 'BeneficiaryAccountRemoved':
        const beneficiaryAccountIdsAfterRemoval = this.getState('beneficiaryAccountIds', []).filter(
          (beneficiaryAccountId: UUID) => beneficiaryAccountId !== event.data.beneficiaryAccountId,
        );
        this.setState('beneficiaryAccountIds', beneficiaryAccountIdsAfterRemoval);
        break;
      default:
        return super.apply(event);
    }

    return event;
  }

  private canOpenIndividualAccount(): boolean {
    const individualAccountId = this.getState('individualAccountId');

    return individualAccountId === null;
  }

  private canOpenBeneficiaryAccount(): boolean {
    if (this.canOpenIndividualAccount()) {
      // Individual account is required to open beneficiary account
      return false;
    }

    const beneficiaryAccountIds = this.getState('beneficiaryAccountIds', []);

    return beneficiaryAccountIds.length < MAX_NUMBER_OF_BENEFICIARIES;
  }

  private canOpenCorporateAccount(): boolean {
    const corporateAccountIds = this.getState('corporateAccountIds', []);

    return corporateAccountIds.length < MAX_NUMBER_OF_CORPORATES;
  }

  private canOpenTrustAccount(): boolean {
    const trustAccountIds = this.getState('trustAccountIds', []);

    return trustAccountIds.length < MAX_NUMBER_OF_TRUSTS;
  }

  removeBeneficiaryAccount(accountId: string): BeneficiaryAccountRemoved {
    if (!this.hasBeneficiaryAccount(accountId)) {
      ProfileException.throw('THE_ACCOUNT_DOES_NOT_EXIST');
    }

    return this.apply(<BeneficiaryAccountRemoved>{
      id: this.getId(),
      kind: 'BeneficiaryAccountRemoved',
      data: {
        beneficiaryAccountId: accountId,
      },
    });
  }

  private hasBeneficiaryAccount(accountId: UUID): boolean {
    return this.getState('beneficiaryAccountIds', []).includes(accountId);
  }
}

export default Profile;
