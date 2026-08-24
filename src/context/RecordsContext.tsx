import { advanceRecordStage, createRecord, loadRecords, undoRecordStage } from '@/lib/recordsStore';
import { lastCompletedStageIndex } from '@/lib/recordStages';
import type { CreateRecordInput, LegalRecord, StageAdvancePayload } from '@/types/record';
import type { Official } from '@/types/official';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type RecordsContextValue = {
  records: LegalRecord[];
  loading: boolean;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  selectedRecord: LegalRecord | null;
  visibleRecords: LegalRecord[];
  createNewRecord: (input: Omit<CreateRecordInput, 'createdById' | 'createdByName'>) => Promise<LegalRecord>;
  advanceStage: (recordId: string, payload?: StageAdvancePayload) => Promise<LegalRecord | null>;
  undoStage: (recordId: string) => Promise<LegalRecord | null>;
  canUpdateStage: (record: LegalRecord) => boolean;
  canUndoStage: (record: LegalRecord) => boolean;
  refresh: () => Promise<void>;
};

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({
  official,
  children,
}: {
  official: Official;
  children: React.ReactNode;
}) {
  const [records, setRecords] = useState<LegalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadRecords();
    setRecords(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const visibleRecords = useMemo(() => {
    if (official.role === 'court') return records;
    return records.filter((r) => r.assignedPoliceId === official.id);
  }, [records, official]);

  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedId) ?? visibleRecords[0] ?? null,
    [records, selectedId, visibleRecords],
  );

  useEffect(() => {
    if (!selectedId && visibleRecords.length > 0) {
      setSelectedId(visibleRecords[0].id);
    }
  }, [selectedId, visibleRecords]);

  const createNewRecord = useCallback(
    async (input: Omit<CreateRecordInput, 'createdById' | 'createdByName'>) => {
      const record = await createRecord({
        ...input,
        createdById: official.id,
        createdByName: official.fullName,
      });
      await refresh();
      setSelectedId(record.id);
      return record;
    },
    [official, refresh],
  );

  const advanceStage = useCallback(
    async (recordId: string, payload?: StageAdvancePayload) => {
      const updated = await advanceRecordStage(recordId, official.id, payload);
      if (updated) await refresh();
      return updated;
    },
    [official.id, refresh],
  );

  const undoStage = useCallback(
    async (recordId: string) => {
      const updated = await undoRecordStage(recordId, official.id);
      if (updated) await refresh();
      return updated;
    },
    [official.id, refresh],
  );

  const canUpdateStage = useCallback(
    (record: LegalRecord) => official.role === 'police' && record.assignedPoliceId === official.id,
    [official],
  );

  const canUndoStage = useCallback(
    (record: LegalRecord) => canUpdateStage(record) && lastCompletedStageIndex(record) > 0,
    [canUpdateStage],
  );

  const value = useMemo(
    () => ({
      records,
      loading,
      selectedId,
      setSelectedId,
      selectedRecord,
      visibleRecords,
      createNewRecord,
      advanceStage,
      undoStage,
      canUpdateStage,
      canUndoStage,
      refresh,
    }),
    [
      records,
      loading,
      selectedId,
      selectedRecord,
      visibleRecords,
      createNewRecord,
      advanceStage,
      undoStage,
      canUpdateStage,
      canUndoStage,
      refresh,
    ],
  );

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function useRecords() {
  const ctx = useContext(RecordsContext);
  if (!ctx) throw new Error('useRecords must be used within RecordsProvider');
  return ctx;
}
