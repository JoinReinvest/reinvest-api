import { UUID } from 'HKEKTypes/Generics';
import { PropertyStatus } from 'Portfolio/Domain/Property';

export interface PropertySchema {
  adminJson: string;
  dataJson: string;
  dealpathJson: string;
  id: number;
  lastUpdate: Date;
  portfolioId: UUID;
  status: PropertyStatus;
}
