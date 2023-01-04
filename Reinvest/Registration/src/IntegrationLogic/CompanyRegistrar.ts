import { MappingRepositoryInterface } from "../Adapter/Database/MappingRepositoryInterface";
import { NorthCapitalRegistrarAdapterInterface } from "../Adapter/NorthCapital/NorthCapitalRegistrarAdapterInterface";
import { Result } from "../Common/Result";
import { CompanyToEntityMapper } from "./Mapper/CompanyToEntityMapper";
import { Company } from "./Model/Company";

class CompanyRegistrar {
  private northCapitalRegistrarAdapter: NorthCapitalRegistrarAdapterInterface;
  private mappingRepository: MappingRepositoryInterface;

  constructor(
    northCapitalRegistrarAdapter: NorthCapitalRegistrarAdapterInterface,
    mappingRepository: MappingRepositoryInterface
  ) {
    this.northCapitalRegistrarAdapter = northCapitalRegistrarAdapter;
    this.mappingRepository = mappingRepository;
  }

  public register(company: Company): Result {
    try {
      const entity = CompanyToEntityMapper.map(company);
      const entityId = this.northCapitalRegistrarAdapter.createEntity(entity);
      this.mappingRepository.mapCompanyToEntity(company.getId(), entityId);
    } catch (error: any) {
      return Result.Failed;
    }

    return Result.Success;
  }
}
