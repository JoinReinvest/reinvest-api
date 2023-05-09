import { VerificationStatus } from 'Verification/Domain/ValueObject/VerificationEvents';

export enum NorthCapitalVerificationStatuses {
  'Auto Approved' = 'Auto Approved',
  Pending = 'Pending',
  'Manually Approved' = 'Manually Approved',
  Disapproved = 'Disapproved',
  'Need More Info' = 'Need More Info',
}

export function mapVerificationStatus(status: NorthCapitalVerificationStatuses): VerificationStatus {
  switch (status) {
    case NorthCapitalVerificationStatuses['Auto Approved']:
    case NorthCapitalVerificationStatuses['Manually Approved']:
      return VerificationStatus.APPROVED;
    case NorthCapitalVerificationStatuses.Disapproved:
      return VerificationStatus.DISAPPROVED;
    case NorthCapitalVerificationStatuses.Pending:
      return VerificationStatus.PENDING;
    case NorthCapitalVerificationStatuses['Need More Info']:
      return VerificationStatus.NEED_MORE_INFO;
    default:
      throw new Error(`Unknown North Capital verification status: ${status}`);
  }
}
