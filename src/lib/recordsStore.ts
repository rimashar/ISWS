import { supabase } from '@/lib/supabase';
import { buildInitialStages, isProofStage, isServedStage, lastCompletedStageIndex } from '@/lib/recordStages';
import { POLICE_ROSTER } from '@/lib/policeRoster';
import { formatCoordinates, serviceMethodMeta } from '@/lib/serviceProof';
import type { CreateRecordInput, LegalRecord, RecordStatus, ServiceProof, ServedDetails, StageAdvancePayload } from '@/types/record';

const STORAGE_KEY = 'nyayasetu_records';
let counter = 200;

function nextReference(recordType: 'summons' | 'warrant', existing: LegalRecord[]): string {
  const prefix = recordType === 'summons' ? 'SUM' : 'WRN';
  const year = new Date().getFullYear();
  const nums = existing
    .filter((r) => r.referenceNumber.startsWith(`${prefix}-${year}`))
    .map((r) => parseInt(r.referenceNumber.split('-').pop() ?? '0', 10));
  const next = nums.length ? Math.max(...nums) + 1 : counter++;
  return `${prefix}-${year}-${String(next).padStart(4, '0')}`;
}

function deriveStatus(stages: LegalRecord['stages'], category: LegalRecord['category']): RecordStatus {
  const completed = stages.filter((s) => s.completedAt).length;
  if (completed >= stages.length) return 'completed';
  if (completed >= stages.length - 1) return 'served';
  if (category === 'cross_jurisdiction' && completed >= 2) return 'transferred';
  if (completed >= 2) return 'in_progress';
  if (completed >= 1) return 'assigned';
  return 'issued';
}

function readLocal(): LegalRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LegalRecord[]).map(normalizeRecord) : [];
  } catch {
    return [];
  }
}

function writeLocal(records: LegalRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function normalizeRecord(record: LegalRecord): LegalRecord {
  return {
    ...record,
    servedDetails: record.servedDetails ?? null,
    serviceProof: record.serviceProof ?? null,
  };
}

function demoProof(record: Pick<LegalRecord, 'personName' | 'assignedPoliceName' | 'assignedPoliceBadge'>): ServiceProof {
  return {
    photoUrl: '/proof-of-service.svg',
    latitude: 28.6139,
    longitude: 77.209,
    address: 'Connaught Place, New Delhi, 110001',
    servedAt: new Date().toISOString(),
    recipientName: record.personName,
    relationship: 'Addressee',
    methodLabel: 'Physical Service',
    serviceAttempts: 1,
    remarks: 'Served to addressee in person.',
    officerName: record.assignedPoliceName ?? 'HC Rajesh Kumar',
    officerBadge: record.assignedPoliceBadge ?? 'DL-7854',
  };
}

function seedRecords(): LegalRecord[] {
  const court = { id: 'demo-court-5001', name: 'Registrar, District Court Delhi' };
  const delhiPolice = POLICE_ROSTER[0];
  const mumbaiPolice = POLICE_ROSTER[1];
  const now = new Date().toISOString();

  const sameSummons: LegalRecord = {
    id: crypto.randomUUID(),
    recordType: 'summons',
    category: 'same_jurisdiction',
    referenceNumber: 'SUM-2026-0148',
    personName: 'A.B.',
    caseNumber: 'CR/2026/0148',
    status: 'served',
    fromCourt: 'District Court, Delhi',
    fromCity: 'Delhi',
    toCourt: null,
    toCity: null,
    assignedPoliceId: delhiPolice.id,
    assignedPoliceName: delhiPolice.fullName,
    assignedPoliceBadge: delhiPolice.badgeId,
    createdById: court.id,
    createdByName: court.name,
    servedDetails: {
      method: 'person',
      recipientName: 'A.B.',
      relationship: 'Addressee',
    },
    serviceProof: demoProof({
      personName: 'A.B.',
      assignedPoliceName: 'HC Rajesh Kumar',
      assignedPoliceBadge: 'DL-7854',
    }),
    stages: buildInitialStages('summons', 'same_jurisdiction').map((s, i) => {
      if (i > 6) return s;
      if (s.title === 'Served') {
        return { ...s, completedAt: now, detail: 'Served to the person' };
      }
      if (s.title === 'Proof uploaded') {
        return {
          ...s,
          completedAt: now,
          detail: `Geo-tagged photo at ${formatCoordinates(28.6139, 77.209)}`,
        };
      }
      return { ...s, completedAt: s.completedAt ?? now };
    }),
    createdAt: now,
    updatedAt: now,
  };

  const crossSummons: LegalRecord = {
    id: crypto.randomUUID(),
    recordType: 'summons',
    category: 'cross_jurisdiction',
    referenceNumber: 'SUM-2026-0153',
    personName: 'M.N.',
    caseNumber: 'CR/2026/0153',
    status: 'transferred',
    fromCourt: 'District Court, Delhi',
    fromCity: 'Delhi',
    toCourt: 'Mumbai City Police',
    toCity: 'Maharashtra',
    assignedPoliceId: mumbaiPolice.id,
    assignedPoliceName: mumbaiPolice.fullName,
    assignedPoliceBadge: mumbaiPolice.badgeId,
    createdById: court.id,
    createdByName: court.name,
    servedDetails: null,
    serviceProof: null,
    stages: buildInitialStages('summons', 'cross_jurisdiction').map((s, i) => {
      if (i === 0) return { ...s, completedAt: now, detail: 'Request sent to Mumbai City Police' };
      if (i === 1) return { ...s, completedAt: now, detail: 'Accepted by Mumbai City Police' };
      if (i === 2) return { ...s, completedAt: now, detail: 'Execution in progress' };
      return s;
    }),
    createdAt: now,
    updatedAt: now,
  };

  const bailableWarrant: LegalRecord = {
    id: crypto.randomUUID(),
    recordType: 'warrant',
    category: 'bailable',
    referenceNumber: 'WRN-2026-0102',
    personName: 'R.K.',
    caseNumber: 'CR/2026/0102',
    status: 'assigned',
    fromCourt: 'District Court, Delhi',
    fromCity: 'Delhi',
    toCourt: null,
    toCity: null,
    assignedPoliceId: delhiPolice.id,
    assignedPoliceName: delhiPolice.fullName,
    assignedPoliceBadge: delhiPolice.badgeId,
    createdById: court.id,
    createdByName: court.name,
    servedDetails: null,
    serviceProof: null,
    stages: buildInitialStages('warrant', 'bailable'),
    createdAt: now,
    updatedAt: now,
  };

  return [sameSummons, crossSummons, bailableWarrant];
}

export async function loadRecords(): Promise<LegalRecord[]> {
  const { data, error } = await supabase.from('legal_records').select('*').order('created_at', { ascending: false });

  if (!error && data && data.length > 0) {
    const mapped = data.map(mapFromDb);
    writeLocal(mapped);
    return mapped;
  }

  let local = readLocal();
  if (local.length === 0) {
    local = seedRecords();
    writeLocal(local);
  }
  return local;
}

export async function saveRecord(record: LegalRecord): Promise<LegalRecord> {
  const records = readLocal();
  const index = records.findIndex((r) => r.id === record.id);
  if (index >= 0) records[index] = record;
  else records.unshift(record);
  writeLocal(records);

  await supabase.from('legal_records').upsert(mapToDb(record)).then(() => undefined);
  return record;
}

export async function createRecord(input: CreateRecordInput): Promise<LegalRecord> {
  const existing = readLocal();
  const now = new Date().toISOString();
  const stages = buildInitialStages(input.recordType, input.category);

  const record: LegalRecord = {
    id: crypto.randomUUID(),
    recordType: input.recordType,
    category: input.category,
    referenceNumber: nextReference(input.recordType, existing),
    personName: input.personName,
    caseNumber: input.caseNumber,
    status: 'assigned',
    fromCourt: input.fromCourt,
    fromCity: input.fromCity,
    toCourt: input.toCourt ?? null,
    toCity: input.toCity ?? null,
    assignedPoliceId: input.assignedPoliceId,
    assignedPoliceName: input.assignedPoliceName,
    assignedPoliceBadge: input.assignedPoliceBadge,
    createdById: input.createdById,
    createdByName: input.createdByName,
    stages,
    servedDetails: null,
    serviceProof: null,
    createdAt: now,
    updatedAt: now,
  };

  return saveRecord(record);
}

export async function advanceRecordStage(
  recordId: string,
  officialId: string,
  payload?: StageAdvancePayload,
): Promise<LegalRecord | null> {
  const records = readLocal();
  const record = records.find((r) => r.id === recordId);
  if (!record || record.assignedPoliceId !== officialId) return null;

  const nextIndex = record.stages.findIndex((s) => !s.completedAt);
  if (nextIndex === -1) return record;

  const nextStage = record.stages[nextIndex];
  const now = new Date().toISOString();

  let servedDetails: ServedDetails | null = record.servedDetails;
  let serviceProof: ServiceProof | null = record.serviceProof;
  let detail = payload?.detail;

  if (isServedStage(nextStage.title) && record.recordType === 'summons') {
    if (!payload?.servedDetails) return record;
    servedDetails = payload.servedDetails;
    detail = detail ?? serviceMethodMeta(servedDetails.method).title;
  }

  if (isProofStage(nextStage.title)) {
    if (!payload?.serviceProof) return record;
    serviceProof = payload.serviceProof;
    detail =
      detail ??
      `Geo-tagged photo at ${formatCoordinates(serviceProof.latitude, serviceProof.longitude)}`;
  }

  const updatedStages = record.stages.map((stage, i) =>
    i === nextIndex ? { ...stage, completedAt: now, detail } : stage,
  );

  const updated: LegalRecord = {
    ...record,
    stages: updatedStages,
    servedDetails,
    serviceProof,
    status: deriveStatus(updatedStages, record.category),
    updatedAt: now,
  };

  return saveRecord(updated);
}

export async function undoRecordStage(recordId: string, officialId: string): Promise<LegalRecord | null> {
  const records = readLocal();
  const record = records.find((r) => r.id === recordId);
  if (!record || record.assignedPoliceId !== officialId) return null;

  const lastIndex = lastCompletedStageIndex(record);
  if (lastIndex <= 0) return record;

  const undone = record.stages[lastIndex];
  const now = new Date().toISOString();
  const updatedStages = record.stages.map((stage, i) =>
    i === lastIndex ? { ...stage, completedAt: null, detail: undefined } : stage,
  );

  let servedDetails = record.servedDetails;
  let serviceProof = record.serviceProof;
  if (isServedStage(undone.title)) servedDetails = null;
  if (isProofStage(undone.title)) serviceProof = null;

  const updated: LegalRecord = {
    ...record,
    stages: updatedStages,
    servedDetails,
    serviceProof,
    status: deriveStatus(updatedStages, record.category),
    updatedAt: now,
  };

  return saveRecord(updated);
}

function mapFromDb(row: Record<string, unknown>): LegalRecord {
  return normalizeRecord({
    id: row.id as string,
    recordType: row.record_type as LegalRecord['recordType'],
    category: row.category as LegalRecord['category'],
    referenceNumber: row.reference_number as string,
    personName: row.person_name as string,
    caseNumber: row.case_number as string,
    status: row.status as RecordStatus,
    fromCourt: row.from_court as string,
    fromCity: row.from_city as string,
    toCourt: (row.to_court as string) ?? null,
    toCity: (row.to_city as string) ?? null,
    assignedPoliceId: (row.assigned_police_id as string) ?? null,
    assignedPoliceName: (row.assigned_police_name as string) ?? null,
    assignedPoliceBadge: (row.assigned_police_badge as string) ?? null,
    createdById: row.created_by_id as string,
    createdByName: row.created_by_name as string,
    stages: (row.stages as LegalRecord['stages']) ?? [],
    servedDetails: (row.served_details as ServedDetails) ?? null,
    serviceProof: (row.service_proof as ServiceProof) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  });
}

function mapToDb(record: LegalRecord) {
  return {
    id: record.id,
    record_type: record.recordType,
    category: record.category,
    reference_number: record.referenceNumber,
    person_name: record.personName,
    case_number: record.caseNumber,
    status: record.status,
    from_court: record.fromCourt,
    from_city: record.fromCity,
    to_court: record.toCourt,
    to_city: record.toCity,
    assigned_police_id: record.assignedPoliceId,
    assigned_police_name: record.assignedPoliceName,
    assigned_police_badge: record.assignedPoliceBadge,
    created_by_id: record.createdById,
    created_by_name: record.createdByName,
    stages: record.stages,
    served_details: record.servedDetails,
    service_proof: record.serviceProof,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}
