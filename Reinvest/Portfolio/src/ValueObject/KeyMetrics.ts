export type KeyMetricsInput = {
  projectReturn: string;
  rating: string;
  structure: string;
};
export class KeyMetrics {
  private projectReturn: string;
  private rating: string;
  private structure: string;

  constructor(projectReturn: string, rating: string, structure: string) {
    this.projectReturn = projectReturn;
    this.rating = rating;
    this.structure = structure;
  }

  static create(data: KeyMetricsInput): KeyMetrics {
    const { projectReturn, rating, structure } = data;

    return new KeyMetrics(projectReturn, rating, structure);
  }

  toObject() {
    return {
      projectReturn: this.projectReturn,
      rating: this.rating,
      structure: this.structure,
    };
  }
}
