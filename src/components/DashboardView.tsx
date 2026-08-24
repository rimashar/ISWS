import { useMemo, useState } from 'react';
import { CalendarDays, Check, ChevronRight, Clock3, FileText, Globe2, MapPin, RefreshCw, ShieldCheck } from 'lucide-react';
import ProgressTracker from '@/components/ProgressTracker';
import { formatStageTimestamp, statusLabel } from '@/lib/recordStages';
import { useRecords } from '@/context/RecordsContext';
import type { Official } from '@/types/official';

type DashboardViewProps = {
  official: Official;
  onOpenTracking: () => void;
  onOpenWarrants: () => void;
  onShowRecord: () => void;
};

export default function DashboardView({ official, onOpenTracking, onOpenWarrants, onShowRecord }: DashboardViewProps) {
  const { visibleRecords, selectedRecord, setSelectedId, canUpdateStage, advanceStage } = useRecords();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const record = selectedRecord ?? visibleRecords[0] ?? null;
  const completedCount = record ? record.stages.filter((s) => s.completedAt).length : 0;
  const progressPct = record ? Math.round((completedCount / record.stages.length) * 100) : 0;

  const statusText = useMemo(() => {
    if (!record) return 'No active cases';
    const next = record.stages.find((s) => !s.completedAt);
    return next ? `${next.title} pending` : 'Case fully complete';
  }, [record]);

  const handleAdvance = async () => {
    if (!record) return;
    const updated = await advanceStage(record.id);
    if (updated) {
      const next = updated.stages.find((s) => !s.completedAt);
      setNotice(next ? `Moved to: ${next.title}` : 'All stages complete.');
      window.setTimeout(() => setNotice(''), 3200);
    }
  };

  if (!record) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
        <p className="text-lg font-bold text-[#003c36]">No cases assigned yet</p>
        <p className="mt-2 text-slate-600">
          {official.role === 'court'
            ? 'Create a summons or warrant to begin tracking.'
            : 'Cases assigned to you will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#18865c]">Case overview / Active matter</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#003c36] md:text-[38px]">Case Progress Tracker</h1>
          <p className="mt-2 text-base text-slate-600">Track the status of summons and warrants with complete transparency.</p>
        </div>
        <button
          onClick={() => setHistoryOpen(true)}
          className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#164f47] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <RefreshCw size={17} /> View History
        </button>
      </div>

      {visibleRecords.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {visibleRecords.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                r.id === record.id ? 'bg-[#003c36] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
              }`}
            >
              {r.referenceNumber}
            </button>
          ))}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(0,60,54,0.07)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                {record.recordType === 'summons' ? 'Summons ID' : 'Warrant ID'}
              </p>
              <p className="mt-1 text-lg font-bold text-[#003c36]">{record.referenceNumber}</p>
            </div>
            <span className="rounded-full bg-[#e4f6e8] px-3 py-1 text-xs font-bold text-[#16814e]">
              {statusLabel(record.status).toUpperCase()}
            </span>
          </div>

          <div className="px-6 py-8">
            <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[#18a765] transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
            <ProgressTracker record={record} compact />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays size={17} className="text-[#18865c]" />
              Last updated: <b className="text-slate-700">{formatStageTimestamp(record.updatedAt)}</b>
            </div>
            {canUpdateStage(record) && (
              <button
                onClick={handleAdvance}
                className="rounded-lg bg-[#075e51] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#00483f]"
              >
                Update next stage
              </button>
            )}
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-2xl bg-[#003c36] p-7 text-white shadow-xl">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#0e6256] opacity-60" />
          <div className="relative flex h-full flex-col">
            <div className="mb-10 grid h-16 w-16 place-items-center rounded-2xl bg-[#0d6255] text-[#8beaa1]">
              <FileText size={34} strokeWidth={1.6} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8beaa1]">Current status</p>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-[#a8efb5]">{statusText}</h2>
            <div className="my-8 h-px bg-white/15" />
            <div className="flex items-center gap-3 text-sm text-white/75">
              <Clock3 size={19} />
              <span>
                Assigned to<br />
                <b className="text-white">{record.assignedPoliceName}</b>
              </span>
            </div>
            <button
              onClick={onOpenTracking}
              className="mt-auto flex items-center justify-between border-t border-white/15 pt-5 text-sm font-bold text-[#a8efb5] hover:text-white"
            >
              Open full tracker <ChevronRight size={18} />
            </button>
          </div>
        </aside>
      </section>

      <section className="mt-7 grid gap-6 lg:grid-cols-3">
        <InfoCard icon={MapPin} title="Service details" text="Geo-tagged service record with officer, time and proof." action="View service details" onClick={onOpenTracking} />
        <InfoCard icon={Globe2} title="Cross-jurisdiction" text="Coordinate execution across states through one network." action="Open coordination" onClick={onOpenWarrants} />
        <InfoCard icon={ShieldCheck} title="Verified record" text="Every action is time-stamped and ready for court review." action="Review record" onClick={onShowRecord} />
      </section>

      {historyOpen && (
        <Modal title="Case history" onClose={() => setHistoryOpen(false)}>
          <div className="space-y-4">
            {record.stages
              .filter((s) => s.completedAt)
              .map((stage) => (
                <div key={stage.id} className="flex gap-4">
                  <div className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#e1f5e5] text-[#18865c]">
                    <Check size={14} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{stage.title}</p>
                    <p className="text-sm text-slate-500">{formatStageTimestamp(stage.completedAt!)}</p>
                  </div>
                </div>
              ))}
          </div>
        </Modal>
      )}

      {notice && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-xl bg-[#003c36] px-5 py-4 text-sm font-semibold text-white shadow-2xl">
          <Check className="text-[#91e9a5]" size={18} /> {notice}
        </div>
      )}
    </>
  );
}

function InfoCard({ icon: Icon, title, text, action, onClick }: { icon: typeof MapPin; title: string; text: string; action: string; onClick: () => void }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e5f7e9] text-[#16814e]">
        <Icon size={22} />
      </div>
      <h3 className="mt-5 font-bold text-[#003c36]">{title}</h3>
      <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">{text}</p>
      <button onClick={onClick} className="mt-5 flex items-center gap-1 text-sm font-bold text-[#16814e] hover:text-[#003c36]">
        {action}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#002d29]/55 p-5" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#003c36]">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
