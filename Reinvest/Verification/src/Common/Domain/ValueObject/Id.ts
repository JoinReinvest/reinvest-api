export class Id {
    private readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    toString(): string {
        return this.id;
    }
}