import { ArrowLeftRight, ShieldCheck } from 'lucide-react';
import ProgressTracker from '@/components/ProgressTracker';
import ServiceDetailsPanel from '@/components/ServiceDetailsPanel';
import StageUpdateBar from '@/components/StageUpdateBar';
import { categoryLabel, formatStageTimestamp, statusLabel } from '@/lib/recordStages';
import type { LegalRecord, StageAdvancePayload } from '@/types/record';

type RecordDetailViewProps = {
  record: LegalRecord;
  canAdvance: boolean;
  canUndo: boolean;
  onAdvance: (payload?: StageAdvancePayload) => void;
  onUndo: () => void;
};

export default function RecordDetailView({
  record,
  canAdvance,
  canUndo,
  onAdvance,
  onUndo,
}: RecordDetailViewProps) {
  const isCross = record.category === 'cross_jurisdiction';
  const actions = (
    <StageUpdateBar
      record={record}
      canAdvance={canAdvance}
      canUndo={canUndo}
      onAdvance={onAdvance}
      onUndo={onUndo}
    />
  );

  return (
    <div className="space-y-6">
      {isCross && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-[#003c36] px-6 py-4">
            <h2 className="text-lg font-bold text-white">Cross-Jurisdiction</h2>
          </div>
          <div className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">From</p>
              <p className="mt-1 font-bold text-[#003c36]">{record.fromCourt}</p>
              <p className="text-sm text-slate-500">{record.fromCity}</p>
            </div>
            <div className="hidden justify-center md:flex">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#e5f7e9] text-[#16814e]">
                <ArrowLeftRight size={18} />
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">To</p>
              <p className="mt-1 font-bold text-[#003c36]">{record.toCourt}</p>
              <p className="text-sm text-slate-500">{record.toCity}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              {record.recordType === 'summons' ? 'Summons ID' : 'Warrant ID'}
            </p>
            <p className="mt-1 text-xl font-bold text-[#003c36]">{record.referenceNumber}</p>
          </div>
          <span className="rounded-full bg-[#e4f6e8] px-3 py-1 text-xs font-bold text-[#16814e]">
            {statusLabel(record.status)}
          </span>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
          <div>
            <span className="text-slate-400">Person</span>
            <p className="mt-1 font-bold">{record.personName}</p>
          </div>
          <div>
            <span className="text-slate-400">Case No.</span>
            <p className="mt-1 font-bold">{record.caseNumber}</p>
          </div>
          <div>
            <span className="text-slate-400">Category</span>
            <p className="mt-1 font-bold">{categoryLabel(record.category)}</p>
          </div>
          <div>
            <span className="text-slate-400">Assigned officer</span>
            <p className="mt-1 font-bold">{record.assignedPoliceName ?? 'Unassigned'}</p>
            {record.assignedPoliceBadge && (
              <p className="text-xs text-slate-500">Badge {record.assignedPoliceBadge}</p>
            )}
          </div>
          {!isCross && (
            <div>
              <span className="text-slate-400">Jurisdiction</span>
              <p className="mt-1 font-bold">{record.fromCourt}</p>
              <p className="text-xs text-slate-500">{record.fromCity}</p>
            </div>
          )}
          <div>
            <span className="text-slate-400">Last updated</span>
            <p className="mt-1 font-bold">{formatStageTimestamp(record.updatedAt)}</p>
          </div>
        </div>

        <ProgressTracker record={record} actions={actions} />
      </div>

      {record.serviceProof && <ServiceDetailsPanel record={record} proof={record.serviceProof} />}

      {isCross && (
        <div className="flex items-start gap-3 rounded-xl bg-[#e9f8ec] px-4 py-3 text-sm text-[#16814e]">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
          <p>This summons is being executed through a secure, centralized network.</p>
        </div>
      )}
    </div>
  );
}
