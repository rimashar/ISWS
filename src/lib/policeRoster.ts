import type { PoliceOfficer } from '@/types/record';

/** Police officers available for court assignment */
export const POLICE_ROSTER: PoliceOfficer[] = [
  {
    id: 'demo-police-1042',
    badgeId: 'PD-1042',
    fullName: 'Officer Rajesh Kumar',
    department: 'Delhi Police',
    city: 'Delhi',
  },
  {
    id: 'demo-police-2088',
    badgeId: 'PD-2088',
    fullName: 'Inspector Priya Sharma',
    department: 'Mumbai City Police',
    city: 'Mumbai',
  },
  {
    id: 'demo-police-3011',
    badgeId: 'PD-3011',
    fullName: 'SI Amit Verma',
    department: 'Delhi Police',
    city: 'Delhi',
  },
];

export function findPoliceOfficer(id: string): PoliceOfficer | undefined {
  return POLICE_ROSTER.find((o) => o.id === id);
}
