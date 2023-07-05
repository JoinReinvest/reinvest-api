export type ImpactMetricsInput = {
  jobsCreated: string;
  totalProjectSize: string;
  units: string;
};
export class ImpactMetrics {
  private jobsCreated: string;
  private totalProjectSize: string;
  private units: string;

  constructor(jobsCreated: string, totalProjectSize: string, units: string) {
    this.jobsCreated = jobsCreated;
    this.totalProjectSize = totalProjectSize;
    this.units = units;
  }

  static create(data: ImpactMetricsInput): ImpactMetrics {
    const { jobsCreated, totalProjectSize, units } = data;

    return new ImpactMetrics(jobsCreated, totalProjectSize, units);
  }

  toObject() {
    return {
      jobsCreated: this.jobsCreated,
      totalProjectSize: this.totalProjectSize,
      units: this.units,
    };
  }
}
