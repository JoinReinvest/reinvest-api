import { MappingQueryInterface } from "../Adapter/Database/MappingQueryInterface";
import { MappingRepositoryInterface } from "../Adapter/Database/MappingRepositoryInterface";
import { NorthCapitalAccountRegistrarAdapterInterface } from "../Adapter/NorthCapital/NorthCapitalAccountRegistrarAdapterInterface";
import { VertaloInvestorRegistrarAdapterInterface } from "../Adapter/Vertalo/VertaloInvestorRegistrarAdapterInterface";
import { InvestingAccountId, ProfileId } from "../Common/Model/Id";
import { Result } from "../Common/Result";

class BeneficiaryInvestingAccountRegistrar {
  private northCapitalAccountRegistrarAdapter: NorthCapitalAccountRegistrarAdapterInterface;
  private vertaloInvestorRegistrarAdapter: VertaloInvestorRegistrarAdapterInterface;
  private mappingRepository: MappingRepositoryInterface;
  private mappingQuery: MappingQueryInterface;

  constructor(
    northCapitalAccountRegistrarAdapter: NorthCapitalAccountRegistrarAdapterInterface,
    vertaloInvestorRegistrarAdapter: VertaloInvestorRegistrarAdapterInterface,
    mappingRepository: MappingRepositoryInterface,
    mappingQuery: MappingQueryInterface
  ) {
    this.vertaloInvestorRegistrarAdapter = vertaloInvestorRegistrarAdapter;
    this.northCapitalAccountRegistrarAdapter =
      northCapitalAccountRegistrarAdapter;
    this.mappingRepository = mappingRepository;
    this.mappingQuery = mappingQuery;
  }

  public register(
    profileId: ProfileId,
    ownerInvestingAccountId: InvestingAccountId,
    beneficiaryInvestingAccountId: InvestingAccountId
  ): Result {
    try {
      const accountId = this.mappingQuery.getNCAccountForInvestingAccount(
        ownerInvestingAccountId
      );

      this.mappingRepository.mapInvestingAccountToNCAccount(
        beneficiaryInvestingAccountId,
        accountId
      );

      const investorId =
        this.vertaloInvestorRegistrarAdapter.registerInvestorAccount(
          profileId,
          beneficiaryInvestingAccountId
        );
      this.mappingRepository.mapInvestingAccountToInvestor(
        beneficiaryInvestingAccountId,
        investorId
      );
    } catch (error: any) {
      return Result.Failed;
    }

    return Result.Success;
  }
}
