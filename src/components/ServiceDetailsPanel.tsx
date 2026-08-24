import { useState } from 'react';
import {
  Clock3,
  Eye,
  FileText,
  MapPin,
  MessageSquare,
  RefreshCw,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { formatCoordinates, formatServiceTime, osmEmbedUrl } from '@/lib/serviceProof';
import type { LegalRecord, ServiceProof } from '@/types/record';

type ServiceDetailsPanelProps = {
  record: LegalRecord;
  proof: ServiceProof;
};

export default function ServiceDetailsPanel({ record, proof }: ServiceDetailsPanelProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-extrabold tracking-wide text-[#1e3a8a]">SERVICE DETAILS</h2>
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <dl className="space-y-4 text-sm">
            <DetailRow icon={User} label="Recipient" value={proof.recipientName} />
            <DetailRow icon={Users} label="Relationship" value={proof.relationship} />
            <DetailRow
              icon={MapPin}
              label="Location"
              value={
                <>
                  <span className="block">{formatCoordinates(proof.latitude, proof.longitude)}</span>
                  <span className="block text-slate-500">{proof.address}</span>
                </>
              }
            />
            <DetailRow icon={Clock3} label="Time" value={formatServiceTime(proof.servedAt)} />
            <DetailRow
              icon={Shield}
              label="Officer"
              value={`${proof.officerName || record.assignedPoliceName} (${proof.officerBadge || record.assignedPoliceBadge})`}
            />
            <DetailRow icon={FileText} label="Method" value={proof.methodLabel} />
            <DetailRow icon={RefreshCw} label="Service Attempts" value={String(proof.serviceAttempts)} />
            <DetailRow icon={MessageSquare} label="Remarks" value={proof.remarks} />
          </dl>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <p className="border-b border-slate-100 px-3 py-2 text-xs font-bold tracking-wide text-[#1e3a8a]">
                LOCATION (GEO-TAG)
              </p>
              <iframe
                title="Service location map"
                src={osmEmbedUrl(proof.latitude, proof.longitude)}
                className="h-40 w-full border-0"
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <p className="border-b border-slate-100 px-3 py-2 text-xs font-bold tracking-wide text-[#1e3a8a]">
                PROOF OF SERVICE
              </p>
              <img src={proof.photoUrl} alt="Proof of service" className="h-44 w-full object-cover" />
              <button
                onClick={() => setPreviewOpen(true)}
                className="flex w-full items-center justify-center gap-2 bg-[#2563eb] py-3 text-sm font-bold text-white hover:bg-[#1d4ed8]"
              >
                <Eye size={16} /> VIEW RECORD
              </button>
            </div>
          </div>
        </div>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#002d29]/70 p-5" onClick={() => setPreviewOpen(false)}>
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <p className="font-bold text-[#003c36]">Verified service record · {record.referenceNumber}</p>
              <button onClick={() => setPreviewOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                ×
              </button>
            </div>
            <img src={proof.photoUrl} alt="Full proof of service" className="max-h-[70vh] w-full object-contain bg-slate-50" />
          </div>
        </div>
      )}
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#93c5fd] text-[#2563eb]">
        <Icon size={16} />
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
        <dd className="mt-0.5 font-semibold text-slate-800">{value}</dd>
      </div>
    </div>
  );
}
