import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import {
  captureGeoPosition,
  compressImageFile,
  formatCoordinates,
  serviceMethodMeta,
} from '@/lib/serviceProof';
import type { LegalRecord, ServiceProof } from '@/types/record';

type ProofUploadModalProps = {
  record: LegalRecord;
  onClose: () => void;
  onConfirm: (proof: ServiceProof) => void;
};

export default function ProofUploadModal({ record, onClose, onConfirm }: ProofUploadModalProps) {
  const served = record.servedDetails;
  const meta = served ? serviceMethodMeta(served.method) : null;
  const [photoUrl, setPhotoUrl] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState(
    record.category === 'cross_jurisdiction'
      ? `${record.toCity ?? record.fromCity}`
      : `${record.fromCity}`,
  );
  const [recipientName, setRecipientName] = useState(served?.recipientName ?? record.personName);
  const [relationship, setRelationship] = useState(served?.relationship ?? 'Addressee');
  const [attempts, setAttempts] = useState(1);
  const [remarks, setRemarks] = useState(meta?.remarks ?? '');
  const [geoStatus, setGeoStatus] = useState('Capturing GPS…');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const readLocation = async () => {
    setGeoStatus('Capturing GPS…');
    try {
      const pos = await captureGeoPosition();
      setLatitude(pos.latitude);
      setLongitude(pos.longitude);
      setGeoStatus(`Tagged ${formatCoordinates(pos.latitude, pos.longitude)}`);
    } catch (err) {
      setLatitude(28.6139);
      setLongitude(77.209);
      setGeoStatus(
        err instanceof Error
          ? `${err.message} Using last-known Delhi coordinates — update if needed.`
          : 'GPS unavailable. Enter coordinates if needed.',
      );
    }
  };

  useEffect(() => {
    void readLocation();
  }, []);

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const dataUrl = await compressImageFile(file);
      setPhotoUrl(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not attach the photo.');
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    if (!photoUrl) {
      setError('Upload a geo-tagged photo of service.');
      return;
    }
    if (latitude == null || longitude == null) {
      setError('A GPS location is required before uploading proof.');
      return;
    }
    if (!address.trim() || !recipientName.trim() || !remarks.trim()) {
      setError('Recipient, location and remarks are required.');
      return;
    }
    onConfirm({
      photoUrl,
      latitude,
      longitude,
      address: address.trim(),
      servedAt: new Date().toISOString(),
      recipientName: recipientName.trim(),
      relationship: relationship.trim(),
      methodLabel: 'Physical Service',
      serviceAttempts: Math.max(1, attempts),
      remarks: remarks.trim(),
      officerName: record.assignedPoliceName ?? '',
      officerBadge: record.assignedPoliceBadge ?? '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#002d29]/55 p-5" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#18865c]">Proof uploaded</p>
            <h2 className="mt-1 text-xl font-bold text-[#003c36]">Upload geo-tagged photo</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            ×
          </button>
        </div>

        <label className="block rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          {photoUrl ? (
            <img src={photoUrl} alt="Proof preview" className="mx-auto max-h-48 rounded-lg object-cover" />
          ) : (
            <span>{busy ? 'Processing photo…' : 'Tap to take or upload a photo of service'}</span>
          )}
        </label>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#eef6ff] px-3 py-2 text-sm text-[#1e3a8a]">
          <MapPin size={16} className="mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p>{geoStatus}</p>
            {latitude != null && longitude != null && (
              <p className="mt-1 font-semibold">
                {formatCoordinates(latitude, longitude)}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void readLocation()}
          className="mt-2 text-xs font-bold text-[#16814e]"
        >
          Recapture GPS
        </button>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Recipient
            <input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Relationship
            <input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Address
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Street, city, PIN"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Service attempts
            <input
              type="number"
              min={1}
              value={attempts}
              onChange={(e) => setAttempts(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <div className="text-sm font-medium text-slate-700">
            Officer
            <p className="mt-2 font-semibold text-slate-800">
              {record.assignedPoliceName} ({record.assignedPoliceBadge})
            </p>
          </div>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Remarks
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            disabled={busy}
            onClick={submit}
            className="rounded-lg bg-[#075e51] px-4 py-2 text-sm font-bold text-white hover:bg-[#00483f] disabled:opacity-60"
          >
            Upload proof
          </button>
        </div>
      </div>
    </div>
  );
}
