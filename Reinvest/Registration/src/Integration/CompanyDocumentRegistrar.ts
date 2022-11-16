import {NorthCapitalRegistrarAdapterInterface} from "../Adapter/NorthCapital/NorthCapitalRegistrarAdapterInterface";
import {Result} from "../Common/Result";
import {MappingQueryInterface} from "../Adapter/Database/MappingQueryInterface";
import {CompanyId} from "../Common/Model/Id";
import {Document} from "./Model/Document";

class CompanyDocumentRegistrar {
    private northCapitalRegistrarAdapter: NorthCapitalRegistrarAdapterInterface;
    private mappingQuery: MappingQueryInterface;

    constructor(
        northCapitalRegistrarAdapter: NorthCapitalRegistrarAdapterInterface,
        mappingQuery: MappingQueryInterface
    ) {
        this.northCapitalRegistrarAdapter = northCapitalRegistrarAdapter;
        this.mappingQuery = mappingQuery;
    }

    public register(document: Document, companyId: CompanyId): Result {
        try {
            const entityId = this.mappingQuery.getCompanyEntityId(companyId);
            this.northCapitalRegistrarAdapter.attachDocumentToEntity(document.path, entityId);
        } catch (error: any) {
            return Result.Failed;
        }

        return Result.Success;
    }
}