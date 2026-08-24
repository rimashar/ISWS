export type RecordType = 'summons' | 'warrant';

export type SummonsCategory = 'same_jurisdiction' | 'cross_jurisdiction';
export type WarrantCategory = 'bailable' | 'non_bailable';
export type RecordCategory = SummonsCategory | WarrantCategory;

export type RecordStatus =
  | 'issued'
  | 'assigned'
  | 'in_progress'
  | 'transferred'
  | 'served'
  | 'completed';

export type ServiceMethod = 'person' | 'family' | 'affixed';

export type StageEvent = {
  id: string;
  title: string;
  detail?: string;
  completedAt: string | null;
};

export type ServedDetails = {
  method: ServiceMethod;
  recipientName: string;
  relationship: string;
  familyMemberName?: string;
};

export type ServiceProof = {
  photoUrl: string;
  latitude: number;
  longitude: number;
  address: string;
  servedAt: string;
  recipientName: string;
  relationship: string;
  methodLabel: string;
  serviceAttempts: number;
  remarks: string;
  officerName: string;
  officerBadge: string;
};

export type StageAdvancePayload = {
  detail?: string;
  servedDetails?: ServedDetails;
  serviceProof?: ServiceProof;
};

export type LegalRecord = {
  id: string;
  recordType: RecordType;
  category: RecordCategory;
  referenceNumber: string;
  personName: string;
  caseNumber: string;
  status: RecordStatus;
  fromCourt: string;
  fromCity: string;
  toCourt: string | null;
  toCity: string | null;
  assignedPoliceId: string | null;
  assignedPoliceName: string | null;
  assignedPoliceBadge: string | null;
  createdById: string;
  createdByName: string;
  stages: StageEvent[];
  servedDetails: ServedDetails | null;
  serviceProof: ServiceProof | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateRecordInput = {
  recordType: RecordType;
  category: RecordCategory;
  personName: string;
  caseNumber: string;
  fromCourt: string;
  fromCity: string;
  toCourt?: string;
  toCity?: string;
  assignedPoliceId: string;
  assignedPoliceName: string;
  assignedPoliceBadge: string;
  createdById: string;
  createdByName: string;
};

export type PoliceOfficer = {
  id: string;
  badgeId: string;
  fullName: string;
  department: string;
  city: string;
};
