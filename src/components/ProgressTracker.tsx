import { Check, ChevronRight } from 'lucide-react';
import { formatStageTimestamp } from '@/lib/recordStages';
import type { LegalRecord } from '@/types/record';

type ProgressTrackerProps = {
  record: LegalRecord;
  compact?: boolean;
  actions?: React.ReactNode;
};

export default function ProgressTracker({ record, compact, actions }: ProgressTrackerProps) {
  const completedCount = record.stages.filter((s) => s.completedAt).length;

  if (compact) {
    return (
      <div className="space-y-3">
        {record.stages.map((stage) => (
          <div key={stage.id} className="flex items-start gap-3">
            <div
              className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                stage.completedAt ? 'bg-[#18a765] text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {stage.completedAt ? <Check size={14} /> : <span className="h-2 w-2 rounded-full bg-slate-300" />}
            </div>
            <div>
              <p className={`text-sm font-semibold ${stage.completedAt ? 'text-slate-800' : 'text-slate-500'}`}>
                {stage.title}
              </p>
              {stage.completedAt && (
                <p className="text-xs text-slate-500">{formatStageTimestamp(stage.completedAt)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Progress tracker</p>
          <p className="mt-1 text-sm text-slate-600">
            {completedCount} of {record.stages.length} stages complete
          </p>
        </div>
        {actions}
      </div>

      <div className="relative">
        <div className="absolute bottom-4 left-[15px] top-4 w-0.5 bg-[#18a765]/30" />
        <div className="space-y-5">
          {record.stages.map((stage) => (
            <div key={stage.id} className="relative flex gap-4 pl-1">
              <div
                className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-white shadow ${
                  stage.completedAt ? 'bg-[#18a765] text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {stage.completedAt ? <Check size={15} /> : <span className="h-2 w-2 rounded-full bg-slate-300" />}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={`font-semibold ${stage.completedAt ? 'text-slate-800' : 'text-slate-500'}`}>
                    {stage.title}
                  </p>
                  {stage.completedAt && (
                    <span className="text-xs font-medium text-slate-500">
                      {formatStageTimestamp(stage.completedAt)}
                    </span>
                  )}
                </div>
                {stage.detail && <p className="mt-1 text-sm text-slate-500">{stage.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {compact ? null : <div className="mt-5">{actions}</div>}
    </div>
  );
}

export function RecordSummaryCard({
  record,
  active,
  onClick,
}: {
  record: LegalRecord;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-4 text-left transition ${
        active ? 'border-[#18a765] bg-[#f1faf2]' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div>
        <p className="font-bold text-slate-800">{record.referenceNumber}</p>
        <p className="mt-1 text-sm text-slate-500">
          {record.personName} · {record.caseNumber}
        </p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-slate-400" />
    </button>
  );
}
