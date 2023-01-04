import { UniqueId } from "../../../Commons/UniqueId";

export interface UniqueIdGenerator {
  create(): UniqueId;
}
