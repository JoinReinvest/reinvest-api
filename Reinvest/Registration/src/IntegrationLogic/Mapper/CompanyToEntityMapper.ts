import { Entity } from "../../Adapter/NorthCapital/Model/Entity";
import { Company } from "../Model/Company";

export class CompanyToEntityMapper {
  static map(company: Company): Entity {
    return new Entity();
  }
}
