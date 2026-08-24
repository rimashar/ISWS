import { useState } from 'react';
import {
  Bell,
  CircleHelp,
  FileCheck2,
  FileText,
  Gavel,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Navigation,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import Login from '@/Login';
import DashboardView from '@/components/DashboardView';
import SummonsView from '@/components/SummonsView';
import WarrantsView from '@/components/WarrantsView';
import TrackingView, { VerifiedRecordModal } from '@/components/TrackingView';
import NotificationsView from '@/components/NotificationsView';
import { RecordsProvider, useRecords } from '@/context/RecordsContext';
import type { Official } from '@/types/official';

const AUTH_STORAGE_KEY = 'nyayasetu_official';

type View = 'Dashboard' | 'Summons' | 'Warrants' | 'Tracking' | 'Reports' | 'Notifications';

const navItems: { label: View; icon: typeof Home }[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Summons', icon: FileText },
  { label: 'Warrants', icon: Gavel },
  { label: 'Tracking', icon: Navigation },
  { label: 'Reports', icon: FileCheck2 },
  { label: 'Notifications', icon: Bell },
];

function AppShell({ official, onLogout }: { official: Official; onLogout: () => void }) {
  const [view, setView] = useState<View>('Dashboard');
  const [mobileNav, setMobileNav] = useState(false);
  const [showRecord, setShowRecord] = useState(false);
  const { selectedRecord } = useRecords();

  const portalLabel = official.role === 'court' ? 'Court Portal' : 'Officer Portal';

  return (
    <div className="min-h-screen bg-[#f5f8f7] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#003c36] text-white shadow-lg">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center px-5 lg:px-10">
          <button
            className="mr-4 rounded-lg p-2 hover:bg-white/10 lg:hidden"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label="Open navigation"
          >
            <Menu size={24} />
          </button>
          <div className="mr-10 flex items-center gap-3 border-r border-white/15 pr-8">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#90e7a4] text-[#003c36]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">
                IS<span className="text-[#90e7a4]">WS</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Integrated Summons and Warrants System</p>
            </div>
          </div>
          <nav className="hidden h-full items-center gap-1 lg:flex">
            {navItems.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setView(label)}
                className={`relative flex h-full items-center gap-2.5 px-4 text-sm font-medium transition hover:text-[#a8efb5] ${
                  view === label ? 'text-[#a8efb5]' : 'text-white/75'
                }`}
              >
                <Icon size={19} strokeWidth={1.8} />
                {label}
                {view === label && (
                  <span className="absolute bottom-0 left-3 right-3 h-1 rounded-t bg-[#91e9a5]" />
                )}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <button className="hidden rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white sm:block">
              <CircleHelp size={20} />
            </button>
            <button
              onClick={() => setView('Notifications')}
              className="relative rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Bell size={20} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#ffb26b]" />
            </button>
            <div className="hidden h-8 w-px bg-white/15 sm:block" />
            <div className="hidden items-center gap-2 text-sm sm:flex">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-[#d5f1dc] text-[#00675a]">
                <UserRound size={16} />
              </div>
              <span>
                {portalLabel} · {official.fullName}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Sign out"
            >
              <LogOut size={17} />
              <span className="hidden lg:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {mobileNav && (
        <div className="fixed inset-0 z-30 bg-[#003c36]/55 lg:hidden" onClick={() => setMobileNav(false)}>
          <aside
            className="h-full w-72 bg-[#003c36] p-5 text-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <b>Navigation</b>
              <button onClick={() => setMobileNav(false)}>
                <X />
              </button>
            </div>
            {navItems.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => {
                  setView(label);
                  setMobileNav(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-white/80 hover:bg-white/10"
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </aside>
        </div>
      )}

      <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-11 animate-[rise-in_0.45s_ease]">
        {view === 'Dashboard' && (
          <DashboardView
            official={official}
            onOpenTracking={() => setView('Tracking')}
            onOpenWarrants={() => setView('Warrants')}
            onShowRecord={() => setShowRecord(true)}
          />
        )}
        {view === 'Summons' && <SummonsView official={official} />}
        {view === 'Warrants' && <WarrantsView official={official} />}
        {view === 'Tracking' && <TrackingView onShowRecord={() => setShowRecord(true)} />}
        {view === 'Notifications' && <NotificationsView />}
        {view === 'Reports' && <ReportsView official={official} />}
      </main>

      {showRecord && (
        <VerifiedRecordModal
          recordRef={selectedRecord?.referenceNumber ?? '—'}
          onClose={() => setShowRecord(false)}
        />
      )}
    </div>
  );
}

function ReportsView({ official }: { official: Official }) {
  const { visibleRecords } = useRecords();
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#18865c]">Evidence centre</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#003c36]">Reports</h1>
        <p className="mt-2 text-slate-600">
          {official.role === 'court'
            ? 'All issued summons and warrants across the network.'
            : 'Records assigned to you.'}
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {visibleRecords.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">No records to report.</p>
          ) : (
            visibleRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between gap-4 px-6 py-5">
                <div>
                  <p className="font-bold text-slate-800">{record.referenceNumber}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {record.personName} · {record.recordType} · {record.fromCourt}
                  </p>
                </div>
                <span className="rounded-full bg-[#e5f7e9] px-3 py-1 text-xs font-bold capitalize text-[#16814e]">
                  {record.status.replace('_', ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [official, setOfficial] = useState<Official | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Official) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (nextOfficial: Official) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextOfficial));
    setOfficial(nextOfficial);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setOfficial(null);
  };

  if (!official) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <RecordsProvider official={official}>
      <AppShell official={official} onLogout={handleLogout} />
    </RecordsProvider>
  );
}

export default App;
