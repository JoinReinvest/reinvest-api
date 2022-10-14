import {UniqueId} from "../../Domain/Commons/UniqueId";

export interface UniqueIdGenerator {
    create(): UniqueId;
}