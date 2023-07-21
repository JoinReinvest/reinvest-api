import { UUID } from 'HKEKTypes/Generics';
import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { BeneficiaryRepository } from 'LegalEntities/Adapter/Database/Repository/BeneficiaryRepository';
import { ProfileRepository } from 'LegalEntities/Adapter/Database/Repository/ProfileRepository';
import { IdentityService } from 'LegalEntities/Adapter/Modules/IdentityService';
import { CompanyAccount } from 'LegalEntities/Domain/Accounts/CompanyAccount';
import { Profile } from 'LegalEntities/Domain/Profile';
import { FINRAMemberStatement, PersonalStatementType, TradingCompanyStakeholderStatement } from 'LegalEntities/Domain/ValueObject/PersonalStatements';
import { DateTime } from 'Money/DateTime';

export type InvestorAgreementsData = {
  address: string;
  companyAddress: string | null;
  companyName: string;
  dateOfBirth: string;
  email: string;
  firstName: string;
  isAccreditedInvestor: boolean;
  isCompany: boolean;
  isFINRAMember: boolean;
  isTradedCompanyHolder: boolean;
  lastName: string;
  phoneNumber: string;
  purchaserName: string;
  sensitiveNumber: string;
  FINRAInstitutionName?: string;
  tickerSymbols?: string;
};

export type WithdrawalAgreementData = {
  address: string;
  authorizedOfficer: string;
  email: string;
  isCompany: boolean;
  phoneNumber: string;
  sharesOwnerName: string;
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

  public async getInvestorDataForAgreements(profileId: UUID, accountId: UUID): Promise<InvestorAgreementsData> {
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

  public async getDataForWithdrawalAgreement(profileId: UUID, accountId: UUID): Promise<WithdrawalAgreementData> {
    const { profile, account, isIndividual } = await this.getProfileAndAccount(profileId, accountId);
    const { firstName, lastName, address, companyAddress, companyName, isCompany } = await this.getInvestorData(profile, account, isIndividual);
    const { phoneNumber, email } = await this.getInvestorIdentityData(profileId);

    const addressToUse = isCompany! ? companyAddress! : address!;

    return {
      authorizedOfficer: `${firstName} ${lastName}`,
      sharesOwnerName: isCompany! ? companyName! : `${firstName} ${lastName}`,
      isCompany: isCompany!,
      address: addressToUse ?? 'N/A',
      email: email ?? 'N/A',
      phoneNumber: phoneNumber ?? 'N/A',
    };
  }

  private async getInvestorData(profile: Profile, account: CompanyAccount | null, isIndividual: boolean): Promise<Partial<InvestorAgreementsData>> {
    const { name, dateOfBirth } = profile.toObject();
    const profileAddress = profile.getAddress();
    const companyAddress = account ? account.getAddress() : null;

    return {
      purchaserName: isIndividual ? profile.getFullName() : account!.getCompanyName(),
      firstName: name!.firstName,
      lastName: name!.lastName,
      dateOfBirth: DateTime.from(dateOfBirth!).toFormattedDate('MM/DD/YYYY')!,
      companyName: isIndividual ? '-' : account!.getCompanyName(),
      isCompany: !isIndividual,
      address: profileAddress!.getInlinedAddress(),
      companyAddress: companyAddress ? companyAddress.getInlinedAddress() : null,
      sensitiveNumber: isIndividual ? profile.getRawSSN()! : account!.getRawEIN()!,
    };
  }

  private async getInvestorStatements(profile: Profile): Promise<Partial<InvestorAgreementsData>> {
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

  private async getInvestorIdentityData(profileId: UUID): Promise<Partial<InvestorAgreementsData>> {
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
