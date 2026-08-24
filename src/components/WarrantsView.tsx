import { useMemo, useState } from 'react';
import { Gavel, Plus } from 'lucide-react';
import CreateRecordModal from '@/components/CreateRecordModal';
import RecordDetailView from '@/components/RecordDetailView';
import { RecordSummaryCard } from '@/components/ProgressTracker';
import { useRecords } from '@/context/RecordsContext';
import type { Official } from '@/types/official';
import type { WarrantCategory } from '@/types/record';

const TABS: { id: WarrantCategory; label: string }[] = [
  { id: 'bailable', label: 'Bailable' },
  { id: 'non_bailable', label: 'Non-bailable' },
];

export default function WarrantsView({ official }: { official: Official }) {
  const { visibleRecords, selectedId, setSelectedId, canUpdateStage, advanceStage } = useRecords();
  const [tab, setTab] = useState<WarrantCategory>('bailable');
  const [createOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const filtered = useMemo(
    () => visibleRecords.filter((r) => r.recordType === 'warrant' && r.category === tab),
    [visibleRecords, tab],
  );

  const activeRecord = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null;

  const handleAdvance = async () => {
    if (!activeRecord) return;
    const updated = await advanceStage(activeRecord.id);
    if (updated) {
      setNotice(`Stage updated for ${updated.referenceNumber}.`);
      window.setTimeout(() => setNotice(''), 3200);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#18865c]">Warrants registry</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#003c36]">Warrants</h1>
          <p className="mt-2 text-base text-slate-600">
            {official.role === 'court'
              ? 'Issue bailable and non-bailable warrants and assign execution to officers.'
              : 'View assigned warrants and update execution stages.'}
          </p>
        </div>
        {official.role === 'court' && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex w-fit items-center gap-2 rounded-xl bg-[#075e51] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#00483f]"
          >
            <Plus size={17} /> Create warrant
          </button>
        )}
      </div>

      <div className="mb-6 flex gap-2 rounded-xl border border-slate-200 bg-white p-1.5">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              tab === id ? 'bg-[#003c36] text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[#003c36]">
            <Gavel size={17} /> Active records ({filtered.length})
          </div>
          {filtered.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No {tab.replace('_', '-')} warrants yet.
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((record) => (
                <RecordSummaryCard
                  key={record.id}
                  record={record}
                  active={activeRecord?.id === record.id}
                  onClick={() => setSelectedId(record.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          {activeRecord ? (
            <RecordDetailView
              record={activeRecord}
              canAdvance={canUpdateStage(activeRecord)}
              onAdvance={handleAdvance}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
              Select or create a warrant to view details.
            </div>
          )}
        </div>
      </div>

      {createOpen && (
        <CreateRecordModal
          recordType="warrant"
          category={tab}
          onClose={() => setCreateOpen(false)}
          onCreated={(ref) => {
            setNotice(`${ref} created and assigned.`);
            window.setTimeout(() => setNotice(''), 3200);
          }}
        />
      )}

      {notice && (
        <div className="fixed bottom-6 right-6 z-40 rounded-xl bg-[#003c36] px-5 py-4 text-sm font-semibold text-white shadow-2xl">
          {notice}
        </div>
      )}
    </div>
  );
}
