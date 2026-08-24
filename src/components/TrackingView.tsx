import { Check, ShieldCheck } from 'lucide-react';
import ProgressTracker from '@/components/ProgressTracker';
import { formatStageTimestamp } from '@/lib/recordStages';
import { useRecords } from '@/context/RecordsContext';

export default function TrackingView({ onShowRecord }: { onShowRecord: () => void }) {
  const { selectedRecord, visibleRecords, setSelectedId, canUpdateStage, advanceStage } = useRecords();
  const record = selectedRecord ?? visibleRecords[0] ?? null;

  if (!record) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
        No service records available.
      </div>
    );
  }

  const handleAdvance = async () => {
    await advanceStage(record.id);
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#18865c]">Live status</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#003c36]">Service details & proof</h1>
        <p className="mt-2 text-slate-600">View the complete trail behind {record.referenceNumber}.</p>
      </div>

      {visibleRecords.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {visibleRecords.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                r.id === record.id ? 'bg-[#003c36] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
              }`}
            >
              {r.referenceNumber}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-bold text-[#003c36]">Service record</h2>
          <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-[#f6faf7] p-4 text-sm">
            <div>
              <span className="text-slate-400">Recipient</span>
              <p className="mt-1 font-bold">{record.personName}</p>
            </div>
            <div>
              <span className="text-slate-400">Officer</span>
              <p className="mt-1 font-bold">{record.assignedPoliceName}</p>
            </div>
            <div>
              <span className="text-slate-400">Location</span>
              <p className="mt-1 font-bold">
                {record.category === 'cross_jurisdiction'
                  ? `${record.toCity ?? record.fromCity}`
                  : record.fromCity}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Method</span>
              <p className="mt-1 font-bold">Physical service</p>
            </div>
          </div>
          <ProgressTracker
            record={record}
            compact
            canAdvance={canUpdateStage(record)}
            onAdvance={handleAdvance}
          />
          <button
            onClick={onShowRecord}
            className="mt-6 w-full rounded-xl border border-[#16814e] py-3 text-sm font-bold text-[#16814e] hover:bg-[#e9f8ec]"
          >
            View verified record
          </button>
        </div>

        <div className="rounded-2xl bg-[#003c36] p-7 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#91e9a5]">Activity log</p>
          <div className="mt-5 space-y-4">
            {record.stages
              .filter((s) => s.completedAt)
              .slice(-5)
              .map((stage) => (
                <div key={stage.id} className="flex items-start gap-3">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[#18a765] text-white">
                    <Check size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{stage.title}</p>
                    <p className="text-xs text-white/60">{formatStageTimestamp(stage.completedAt!)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VerifiedRecordModal({ recordRef, onClose }: { recordRef: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#002d29]/55 p-5" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#003c36]">Verified service record</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">×</button>
        </div>
        <div className="rounded-xl bg-[#f1faf2] p-5 text-sm text-slate-700">
          <div className="mb-4 flex items-center gap-3 text-[#16814e]">
            <ShieldCheck />
            <b>Record verified — {recordRef}</b>
          </div>
          <p>This record includes the recipient, location, timestamp, serving officer and proof of service.</p>
          <button onClick={onClose} className="mt-5 rounded-lg bg-[#075e51] px-4 py-2 text-sm font-semibold text-white">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
