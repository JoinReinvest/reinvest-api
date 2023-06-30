export type POIInput = {
  description: string;
  image: string;
  name: string;
  path: string;
};
export class POI {
  private description: string;
  private id: string;
  private name: string;
  private path: string;

  constructor(description: string, id: string, name: string, path: string) {
    this.description = description;
    this.id = id;
    this.name = name;
    this.path = path;
  }

  static create(data: POIInput): POI {
    const { description, image, name, path } = data;

    return new POI(description, image, name, path);
  }

  toObject() {
    return {
      description: this.description,
      id: this.id,
      name: this.name,
      path: this.path,
    };
  }
}
