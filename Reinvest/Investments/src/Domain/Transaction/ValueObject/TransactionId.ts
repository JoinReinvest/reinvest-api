import {UniqueId} from "../../Commons/UniqueId";

export class TransactionId {
    private id: string;

    constructor(id: string) {
        this.id = id;
    }

    static fromUniqueId(id: UniqueId) {
        return new TransactionId(id.toString());
    }

    toString(): string {
        return this.id;
    }

    isEqualTo(id: TransactionId): boolean {
        return this.id === id.toString();
    }
}