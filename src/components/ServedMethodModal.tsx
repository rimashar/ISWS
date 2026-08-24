import { useState } from 'react';
import { SERVICE_METHODS, buildServedDetails } from '@/lib/serviceProof';
import type { ServiceMethod, ServedDetails } from '@/types/record';

type ServedMethodModalProps = {
  personName: string;
  onClose: () => void;
  onConfirm: (details: ServedDetails) => void;
};

export default function ServedMethodModal({ personName, onClose, onConfirm }: ServedMethodModalProps) {
  const [method, setMethod] = useState<ServiceMethod>('person');
  const [familyMemberName, setFamilyMemberName] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (method === 'family' && !familyMemberName.trim()) {
      setError('Enter the family member who received the summons.');
      return;
    }
    onConfirm(buildServedDetails(method, personName, familyMemberName));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#002d29]/55 p-5" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#18865c]">Served stage</p>
            <h2 className="mt-1 text-xl font-bold text-[#003c36]">How was the summons served?</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            ×
          </button>
        </div>

        <div className="space-y-3">
          {SERVICE_METHODS.map((option) => (
            <label
              key={option.id}
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                method === option.id ? 'border-[#18a765] bg-[#f1faf2]' : 'border-slate-200'
              }`}
            >
              <input
                type="radio"
                name="served-method"
                className="mt-1"
                checked={method === option.id}
                onChange={() => {
                  setMethod(option.id);
                  setError('');
                }}
              />
              <span>
                <span className="block font-semibold text-slate-800">{option.title}</span>
                <span className="mt-1 block text-sm text-slate-500">{option.description}</span>
              </span>
            </label>
          ))}
        </div>

        {method === 'family' && (
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Family member name
            <input
              value={familyMemberName}
              onChange={(e) => setFamilyMemberName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Name of the adult family member"
            />
          </label>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={submit}
            className="rounded-lg bg-[#075e51] px-4 py-2 text-sm font-bold text-white hover:bg-[#00483f]"
          >
            Mark as served
          </button>
        </div>
      </div>
    </div>
  );
}
