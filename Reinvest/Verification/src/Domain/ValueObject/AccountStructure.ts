export type IdToNCId = {
  id: string;
  ncId: string;
  syncStatus: boolean;
};

export type AccountStructure = {
  account: IdToNCId;
  profile: IdToNCId;
  type: 'INDIVIDUAL' | 'COMPANY';
  company?: IdToNCId;
  stakeholders?: IdToNCId[];
};
