import type { LegalRecord, RecordCategory, RecordType, StageEvent } from '@/types/record';

const SUMMONS_SAME_STAGES = [
  'Summons issued',
  'Assigned to officer',
  'Service attempt',
  'Recipient identified',
  'Served',
  'Proof uploaded',
  'Court notified',
];

const SUMMONS_CROSS_STAGES = [
  'Request sent to destination',
  'Accepted by destination police',
  'Execution in progress',
  'Recipient identified',
  'Served',
  'Proof uploaded',
  'Court notified',
];

const WARRANT_STAGES = [
  'Warrant issued',
  'Assigned to officer',
  'Execution attempt',
  'Subject located',
  'Warrant executed',
  'Proof uploaded',
  'Court notified',
];

export function stageTemplate(recordType: RecordType, category: RecordCategory): string[] {
  if (recordType === 'summons') {
    return category === 'cross_jurisdiction' ? SUMMONS_CROSS_STAGES : SUMMONS_SAME_STAGES;
  }
  return WARRANT_STAGES;
}

export function buildInitialStages(recordType: RecordType, category: RecordCategory): StageEvent[] {
  const titles = stageTemplate(recordType, category);
  const now = new Date().toISOString();
  return titles.map((title, index) => ({
    id: crypto.randomUUID(),
    title,
    completedAt: index === 0 ? now : null,
    detail: index === 0 ? 'Created by court officer' : undefined,
  }));
}

export function formatStageTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    issued: 'Issued',
    assigned: 'Assigned',
    in_progress: 'In progress',
    transferred: 'Transferred',
    served: 'Served',
    completed: 'Completed',
  };
  return labels[status] ?? status;
}

export function categoryLabel(category: RecordCategory): string {
  const labels: Record<RecordCategory, string> = {
    same_jurisdiction: 'Same jurisdiction',
    cross_jurisdiction: 'Cross-jurisdiction',
    bailable: 'Bailable',
    non_bailable: 'Non-bailable',
  };
  return labels[category];
}

export function nextIncompleteStage(record: LegalRecord): StageEvent | undefined {
  return record.stages.find((s) => !s.completedAt);
}

export function lastCompletedStageIndex(record: LegalRecord): number {
  let last = -1;
  record.stages.forEach((stage, index) => {
    if (stage.completedAt) last = index;
  });
  return last;
}

export function isServedStage(title: string): boolean {
  return title === 'Served';
}

export function isProofStage(title: string): boolean {
  return title === 'Proof uploaded';
}

export function nextStageAction(record: LegalRecord): 'served-choice' | 'proof-upload' | 'simple' | 'done' {
  const next = nextIncompleteStage(record);
  if (!next) return 'done';
  if (record.recordType === 'summons' && isServedStage(next.title)) return 'served-choice';
  if (isProofStage(next.title)) return 'proof-upload';
  return 'simple';
}
