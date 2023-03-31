import { Address, EmploymentStatusType } from 'Registration/Domain/Model/ReinvestTypes';

export type IndividualAccountForSynchronization = {
  accountId: string;
  address: Address;
  name: {
    firstName: string;
    lastName: string;
    middleName?: string;
  };
  profileId: string;
  employmentStatus?: EmploymentStatusType;
  industry?: string;
  nameOfEmployer?: string;
  netIncome?: string;
  netWorth?: string;
  title?: string;
};
