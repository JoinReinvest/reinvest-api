export type ImageInput = {
  id: string;
  path: string;
};

export class Image {
  private id: string;
  private path: string;

  constructor(id: string, path: string) {
    this.id = id;
    this.path = path;
  }

  static create(data: ImageInput): Image {
    const { id, path } = data;

    return new Image(id, path);
  }

  toObject(): ImageInput {
    return {
      id: this.id,
      path: this.path,
    };
  }

  isTheSame(image: Image) {
    return this.id === image.toObject().id;
  }
}
