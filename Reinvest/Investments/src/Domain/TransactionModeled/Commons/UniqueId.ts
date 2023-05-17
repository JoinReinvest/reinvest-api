export class UniqueId {
  private readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  public toString(): string {
    return this.id;
  }
}
