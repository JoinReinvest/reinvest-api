import {NorthCapitalRegistrarAdapterInterface} from "../Adapter/NorthCapital/NorthCapitalRegistrarAdapterInterface";
import {Result} from "../Common/Result";
import {MappingQueryInterface} from "../Adapter/Database/MappingQueryInterface";
import {CompanyId, StakeholderId} from "../Common/Model/Id";

class CompanyStakeholderRegistrar {
    private northCapitalRegistrarAdapter: NorthCapitalRegistrarAdapterInterface;
    private mappingQuery: MappingQueryInterface;

    constructor(
        northCapitalRegistrarAdapter: NorthCapitalRegistrarAdapterInterface,
        mappingQuery: MappingQueryInterface
    ) {
        this.northCapitalRegistrarAdapter = northCapitalRegistrarAdapter;
        this.mappingQuery = mappingQuery;
    }

    public register(stakeholderId: StakeholderId, companyId: CompanyId): Result {
        try {
            const partyId = this.mappingQuery.getStakeholderPartyId(stakeholderId);
            const entityId = this.mappingQuery.getCompanyEntityId(companyId);
            this.northCapitalRegistrarAdapter.attachPartyToEntity(partyId, entityId);
        } catch (error: any) {
            return Result.Failed;
        }

        return Result.Success;
    }
}