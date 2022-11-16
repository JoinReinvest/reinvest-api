import {Company} from "../Model/Company";
import {Entity} from "../../Adapter/NorthCapital/Model/Entity";

export class CompanyToEntityMapper {
    static map(company: Company): Entity {
        return new Entity();
    }
}