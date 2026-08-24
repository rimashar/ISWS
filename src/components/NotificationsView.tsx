import { Bell } from 'lucide-react';
import { formatStageTimestamp } from '@/lib/recordStages';
import { useRecords } from '@/context/RecordsContext';

export default function NotificationsView() {
  const { visibleRecords } = useRecords();

  const notifications = visibleRecords.flatMap((record) => {
    const items: { id: string; title: string; text: string; time: string }[] = [];
    const completed = record.stages.filter((s) => s.completedAt);
    const latest = completed[completed.length - 1];

    if (latest) {
      items.push({
        id: `${record.id}-latest`,
        title: `${record.referenceNumber} updated`,
        text: `${latest.title} — ${record.personName}`,
        time: formatStageTimestamp(latest.completedAt!),
      });
    }

    if (record.category === 'cross_jurisdiction' && record.status === 'transferred') {
      items.push({
        id: `${record.id}-cross`,
        title: 'Cross-jurisdiction request accepted',
        text: `${record.toCourt} accepted execution for ${record.referenceNumber}.`,
        time: formatStageTimestamp(record.updatedAt),
      });
    }

    if (record.status === 'served' || record.status === 'completed') {
      items.push({
        id: `${record.id}-served`,
        title: 'Proof uploaded',
        text: `Verified proof of service is ready for ${record.referenceNumber}.`,
        time: formatStageTimestamp(record.updatedAt),
      });
    }

    return items;
  });

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#18865c]">Updates</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#003c36]">Notifications</h1>
        <p className="mt-2 text-slate-600">Stay informed when a case status changes or a record is verified.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No notifications yet.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div key={n.id} className="flex gap-3 rounded-xl bg-[#f6faf7] p-4">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[#dff5e4] text-[#16814e]">
                  <Bell size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold">{n.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{n.text}</p>
                  <p className="mt-1 text-xs text-slate-400">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
