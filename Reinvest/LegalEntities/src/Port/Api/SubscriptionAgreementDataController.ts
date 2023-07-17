import { UUID } from 'HKEKTypes/Generics';
import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { BeneficiaryRepository } from 'LegalEntities/Adapter/Database/Repository/BeneficiaryRepository';
import { ProfileRepository } from 'LegalEntities/Adapter/Database/Repository/ProfileRepository';
import { IdentityService } from 'LegalEntities/Adapter/Modules/IdentityService';
import { CompanyAccount } from 'LegalEntities/Domain/Accounts/CompanyAccount';
import { Profile } from 'LegalEntities/Domain/Profile';
import { FINRAMemberStatement, PersonalStatementType, TradingCompanyStakeholderStatement } from 'LegalEntities/Domain/ValueObject/PersonalStatements';
import { DateTime } from 'Money/DateTime';

export type SubscriptionAgreementData = {
  address: string;
  companyName: string;
  dateOfBirth: string;
  email: string;
  firstName: string;
  isAccreditedInvestor: boolean;
  isFINRAMember: boolean;
  isTradedCompanyHolder: boolean;
  lastName: string;
  phoneNumber: string;
  purchaserName: string;
  sensitiveNumber: string;
  FINRAInstitutionName?: string;
  tickerSymbols?: string;
};

export class SubscriptionAgreementDataController {
  public static getClassName = (): string => 'SubscriptionAgreementDataController';
  private accountRepository: AccountRepository;
  private profileRepository: ProfileRepository;
  private identityService: IdentityService;
  private beneficiaryRepository: BeneficiaryRepository;

  constructor(
    accountRepository: AccountRepository,
    profileRepository: ProfileRepository,
    identityService: IdentityService,
    beneficiaryRepository: BeneficiaryRepository,
  ) {
    this.profileRepository = profileRepository;
    this.identityService = identityService;
    this.accountRepository = accountRepository;
    this.beneficiaryRepository = beneficiaryRepository;
  }

  public async getDataForSubscriptionAgreement(profileId: UUID, accountId: UUID): Promise<SubscriptionAgreementData> {
    const { profile, account, isIndividual } = await this.getProfileAndAccount(profileId, accountId);
    const investorData = await this.getInvestorData(profile, account, isIndividual);
    const investorStatements = await this.getInvestorStatements(profile);
    const identityData = await this.getInvestorIdentityData(profileId);

    // @ts-ignore
    return {
      ...investorData,
      ...investorStatements,
      ...identityData,
    };
  }

  private async getInvestorData(profile: Profile, account: CompanyAccount | null, isIndividual: boolean): Promise<Partial<SubscriptionAgreementData>> {
    const { name, dateOfBirth } = profile.toObject();
    const address = profile.getAddress();

    return {
      purchaserName: isIndividual ? profile.getFullName() : account!.getCompanyName(),
      firstName: name!.firstName,
      lastName: name!.lastName,
      dateOfBirth: DateTime.from(dateOfBirth!).toFormattedDate('MM/DD/YYYY')!,
      companyName: isIndividual ? '-' : account!.getCompanyName(),
      address: address!.getInlinedAddress(),
      sensitiveNumber: isIndividual ? profile.getRawSSN()! : account!.getRawEIN()!,
    };
  }

  private async getInvestorStatements(profile: Profile): Promise<Partial<SubscriptionAgreementData>> {
    let isAccreditedInvestor = false;
    let isFINRAMember = false;
    let isTradedCompanyHolder = false;
    let FINRAInstitutionName = '';
    let tickerSymbols = '';
    const statements = profile.getStatements();

    for (const statement of statements) {
      if (statement.isType(PersonalStatementType.FINRAMember)) {
        isFINRAMember = true;
        FINRAInstitutionName = (<FINRAMemberStatement>statement).getFINRAInstitutionName();
      }

      if (statement.isType(PersonalStatementType.AccreditedInvestor)) {
        isAccreditedInvestor = true;
      }

      if (statement.isType(PersonalStatementType.TradingCompanyStakeholder)) {
        isTradedCompanyHolder = true;
        tickerSymbols = (<TradingCompanyStakeholderStatement>statement).getInlinedTickerSymbols();
      }
    }

    return {
      isAccreditedInvestor,
      isFINRAMember,
      FINRAInstitutionName,
      isTradedCompanyHolder,
      tickerSymbols,
    };
  }

  private async getInvestorIdentityData(profileId: UUID): Promise<Partial<SubscriptionAgreementData>> {
    const { phoneNumber, email } = await this.identityService.getPhoneAndEmailData(profileId);

    return {
      phoneNumber: phoneNumber || 'N/A',
      email,
    };
  }

  private async getProfileAndAccount(
    profileId: UUID,
    accountId: UUID,
  ): Promise<{
    account: CompanyAccount | null;
    isIndividual: boolean;
    profile: Profile;
  }> {
    const profile = await this.profileRepository.findProfile(profileId);

    if (!profile) {
      throw new Error('Profile not found');
    }

    const beneficiaryAccount = await this.beneficiaryRepository.findBeneficiary(profileId, accountId);

    if (beneficiaryAccount) {
      return {
        profile,
        account: null,
        isIndividual: true,
      };
    }

    const companyAccount = await this.accountRepository.findCompanyAccount(profileId, accountId);

    if (companyAccount) {
      return {
        profile,
        account: companyAccount,
        isIndividual: false,
      };
    }

    const individualAccount = await this.accountRepository.findIndividualAccount(profileId);

    if (!individualAccount || individualAccount.getId() !== accountId) {
      throw new Error('Account not found');
    }

    return { profile, account: null, isIndividual: true };
  }
}
