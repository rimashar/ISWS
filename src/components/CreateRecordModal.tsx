import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { POLICE_ROSTER } from '@/lib/policeRoster';
import type { RecordCategory, RecordType } from '@/types/record';
import { useRecords } from '@/context/RecordsContext';

type CreateRecordModalProps = {
  recordType: RecordType;
  category: RecordCategory;
  onClose: () => void;
  onCreated?: (referenceNumber: string) => void;
};

export default function CreateRecordModal({ recordType, category, onClose, onCreated }: CreateRecordModalProps) {
  const { createNewRecord } = useRecords();
  const [personName, setPersonName] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [fromCourt, setFromCourt] = useState('District Court, Delhi');
  const [fromCity, setFromCity] = useState('Delhi');
  const [toCourt, setToCourt] = useState('');
  const [toCity, setToCity] = useState('');
  const [policeId, setPoliceId] = useState(POLICE_ROSTER[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isCross = category === 'cross_jurisdiction';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!personName.trim() || !caseNumber.trim()) {
      setError('Person name and case number are required.');
      return;
    }
    if (isCross && (!toCourt.trim() || !toCity.trim())) {
      setError('Destination court and city are required for cross-jurisdiction records.');
      return;
    }

    const officer = POLICE_ROSTER.find((o) => o.id === policeId);
    if (!officer) {
      setError('Select an officer to assign.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const record = await createNewRecord({
        recordType,
        category,
        personName: personName.trim(),
        caseNumber: caseNumber.trim(),
        fromCourt: fromCourt.trim(),
        fromCity: fromCity.trim(),
        toCourt: isCross ? toCourt.trim() : undefined,
        toCity: isCross ? toCity.trim() : undefined,
        assignedPoliceId: officer.id,
        assignedPoliceName: officer.fullName,
        assignedPoliceBadge: officer.badgeId,
      });
      onCreated?.(record.referenceNumber);
      onClose();
    } catch {
      setError('Could not create record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#002d29]/55 p-5" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#18865c]">Court action</p>
            <h2 className="text-xl font-bold text-[#003c36]">
              Create {recordType === 'summons' ? 'summons' : 'warrant'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Person name" value={personName} onChange={setPersonName} placeholder="e.g. A.B." />
          <Field label="Case number" value={caseNumber} onChange={setCaseNumber} placeholder="e.g. CR/2026/0148" />

          <div className="grid grid-cols-2 gap-3">
            <Field label="From court" value={fromCourt} onChange={setFromCourt} />
            <Field label="From city" value={fromCity} onChange={setFromCity} />
          </div>

          {isCross && (
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#f6faf7] p-4">
              <Field label="To court / police" value={toCourt} onChange={setToCourt} placeholder="Mumbai City Police" />
              <Field label="To city / state" value={toCity} onChange={setToCity} placeholder="Maharashtra" />
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Assign to officer
            </span>
            <select
              value={policeId}
              onChange={(e) => setPoliceId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#18a765]"
            >
              {POLICE_ROSTER.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.badgeId} — {o.fullName} ({o.department})
                </option>
              ))}
            </select>
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#075e51] py-3.5 text-sm font-bold text-white transition hover:bg-[#00483f] disabled:opacity-70"
          >
            <Plus size={18} />
            {loading ? 'Creating…' : 'Issue & assign'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#18a765] focus:bg-white"
      />
    </label>
  );
}
