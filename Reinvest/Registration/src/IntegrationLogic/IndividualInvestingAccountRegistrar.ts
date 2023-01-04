import { MappingQueryInterface } from "../Adapter/Database/MappingQueryInterface";
import { MappingRepositoryInterface } from "../Adapter/Database/MappingRepositoryInterface";
import { NorthCapitalAccountRegistrarAdapterInterface } from "../Adapter/NorthCapital/NorthCapitalAccountRegistrarAdapterInterface";
import { VertaloInvestorRegistrarAdapterInterface } from "../Adapter/Vertalo/VertaloInvestorRegistrarAdapterInterface";
import { InvestingAccountId, ProfileId } from "../Common/Model/Id";
import { Result } from "../Common/Result";

class IndividualInvestingAccountRegistrar {
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
    investingAccountId: InvestingAccountId
  ): Result {
    try {
      const mainPartyId = this.mappingQuery.getStakeholderPartyId(profileId);

      const accountId =
        this.northCapitalAccountRegistrarAdapter.registerAccountForParty(
          mainPartyId
        );
      this.mappingRepository.mapInvestingAccountToNCAccount(
        investingAccountId,
        accountId
      );

      const investorId =
        this.vertaloInvestorRegistrarAdapter.registerInvestorAccount(
          profileId,
          investingAccountId
        );
      this.mappingRepository.mapInvestingAccountToInvestor(
        investingAccountId,
        investorId
      );
    } catch (error: any) {
      return Result.Failed;
    }

    return Result.Success;
  }
}
