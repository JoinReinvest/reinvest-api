import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';

export enum DividendDistributionStatus {
  DISTRIBUTING = 'DISTRIBUTING',
  DISTRIBUTED = 'DISTRIBUTED',
}

export type DividendsDistributionSchema = {
  distributeToDate: Date;
  id: UUID;
  status: DividendDistributionStatus;
};

export class DividendDistribution {
  private readonly distributeToDate: DateTime;
  private readonly id: UUID;
  private status: DividendDistributionStatus;

  constructor(schema: null, id: UUID, distributeToDate: DateTime);
  constructor(schema: DividendsDistributionSchema);

  constructor(schema: DividendsDistributionSchema | null, id?: UUID, distributeToDate?: DateTime) {
    if (!schema) {
      this.id = id!;
      this.distributeToDate = distributeToDate!;
      this.status = DividendDistributionStatus.DISTRIBUTING;
    } else {
      this.id = schema.id;
      this.distributeToDate = DateTime.fromIsoDate(schema.distributeToDate);
      this.status = schema.status;
    }
  }

  static create(id: UUID, distributeToDate: DateTime): DividendDistribution {
    return new DividendDistribution(null, id, distributeToDate);
  }

  static restore(data: DividendsDistributionSchema): DividendDistribution {
    return new DividendDistribution(data);
  }

  toObject(): DividendsDistributionSchema {
    return {
      distributeToDate: this.distributeToDate.toDate(),
      id: this.id,
      status: this.status,
    };
  }

  getId(): UUID {
    return this.id;
  }

  forFindingAccountsToDistributeDividend(): {
    distributeToDate: DateTime;
    distributionId: UUID;
  } {
    return {
      distributionId: this.id,
      distributeToDate: this.distributeToDate,
    };
  }
}
