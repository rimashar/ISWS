import type { Official } from '@/types/official';

/** Demo credentials seeded in supabase/migrations/20260824145900_create_officials_auth.sql */
export const DEMO_OFFICIALS: Official[] = [
  { id: 'demo-police-1042', role: 'police', identifier: 'PD-1042', fullName: 'Officer Rajesh Kumar' },
  { id: 'demo-police-2088', role: 'police', identifier: 'PD-2088', fullName: 'Inspector Priya Sharma' },
  { id: 'demo-court-5001', role: 'court', identifier: 'CRT-5001', fullName: 'Registrar, District Court Delhi' },
];

const DEMO_PASSWORDS: Record<string, string> = {
  'police:PD-1042': 'police123',
  'police:PD-2088': 'police123',
  'court:CRT-5001': 'court123',
};

export function verifyDemoLogin(role: 'police' | 'court', identifier: string, password: string): Official | null {
  const key = `${role}:${identifier.trim()}`;
  if (DEMO_PASSWORDS[key] !== password) return null;
  return DEMO_OFFICIALS.find((o) => o.role === role && o.identifier === identifier.trim()) ?? null;
}
