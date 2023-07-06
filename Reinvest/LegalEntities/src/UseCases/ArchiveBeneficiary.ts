import { UUID } from 'HKEKTypes/Generics';
import { BeneficiaryRepository } from 'LegalEntities/Adapter/Database/Repository/BeneficiaryRepository';
import { IdentityService } from 'LegalEntities/Adapter/Modules/IdentityService';
import { InvestmentAccountsService } from 'LegalEntities/Adapter/Modules/InvestmentAccountsService';

export class ArchiveBeneficiary {
  public static getClassName = (): string => 'ArchiveBeneficiary';
  private beneficiaryRepository: BeneficiaryRepository;
  private identityService: IdentityService;
  private investmentAccountService: InvestmentAccountsService;

  constructor(beneficiaryRepository: BeneficiaryRepository, identityService: IdentityService, investmentAccountService: InvestmentAccountsService) {
    this.beneficiaryRepository = beneficiaryRepository;
    this.identityService = identityService;
    this.investmentAccountService = investmentAccountService;
  }

  public async execute(profileId: UUID, accountId: UUID): Promise<boolean> {
    const beneficiary = await this.beneficiaryRepository.findBeneficiary(profileId, accountId);

    if (!beneficiary) {
      return false;
    }

    beneficiary.archive();
    await this.beneficiaryRepository.storeBeneficiary(beneficiary);
    await this.investmentAccountService.removeBeneficiary(profileId, accountId);
    await this.identityService.addBannedId(profileId, accountId);

    return true;
  }
}
