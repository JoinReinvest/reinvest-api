import {MappingRepositoryInterface} from "../Adapter/Database/MappingRepositoryInterface";
import {Result} from "../Common/Result";
import {CompanyId, InvestingAccountId, ProfileId} from "../Common/Model/Id";
import {MappingQueryInterface} from "../Adapter/Database/MappingQueryInterface";
import {
    NorthCapitalAccountRegistrarAdapterInterface
} from "../Adapter/NorthCapital/NorthCapitalAccountRegistrarAdapterInterface";
import {VertaloInvestorRegistrarAdapterInterface} from "../Adapter/Vertalo/VertaloInvestorRegistrarAdapterInterface";

class CompanyInvestingAccountRegistrar {
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
        this.northCapitalAccountRegistrarAdapter = northCapitalAccountRegistrarAdapter;
        this.mappingRepository = mappingRepository;
        this.mappingQuery = mappingQuery;
    }

    public register(profileId: ProfileId, companyId: CompanyId, investingAccountId: InvestingAccountId): Result {
        try {
            const entityId = this.mappingQuery.getCompanyEntityId(companyId);
            const mainPartyId = this.mappingQuery.getStakeholderPartyId(profileId);

            const accountId = this.northCapitalAccountRegistrarAdapter.registerAccountForEntity(mainPartyId, entityId);
            this.mappingRepository.mapInvestingAccountToNCAccount(investingAccountId, accountId);

            const investorId = this.vertaloInvestorRegistrarAdapter.registerInvestorAccount(profileId, investingAccountId)
            this.mappingRepository.mapInvestingAccountToInvestor(investingAccountId, investorId);

            this.northCapitalAccountRegistrarAdapter.registerEntityStakeholdersForAccount(entityId);
        } catch (error: any) {
            return Result.Failed;
        }

        return Result.Success;
    }
}