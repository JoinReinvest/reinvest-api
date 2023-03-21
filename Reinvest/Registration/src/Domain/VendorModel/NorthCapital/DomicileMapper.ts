import {DomicileType} from "Registration/Domain/Model/SharedTypes";
import {NorthCapitalDomicile} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes";

export class DomicileMapper {
    static mapDomicile(domicile: DomicileType): NorthCapitalDomicile {
        switch (domicile) {
            case DomicileType.CITIZEN:
                return NorthCapitalDomicile.CITIZEN;
            case DomicileType.GREEN_CARD:
            case DomicileType.VISA:
                return NorthCapitalDomicile.RESIDENT;
            default:
                throw new Error('Unknown domicile type');
        }
    }
}