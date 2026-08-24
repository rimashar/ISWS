import { useState } from 'react';
import { lastCompletedStageIndex, nextIncompleteStage, nextStageAction } from '@/lib/recordStages';
import ProofUploadModal from '@/components/ProofUploadModal';
import ServedMethodModal from '@/components/ServedMethodModal';
import type { LegalRecord, StageAdvancePayload } from '@/types/record';

type StageUpdateBarProps = {
  record: LegalRecord;
  canAdvance: boolean;
  canUndo: boolean;
  onAdvance: (payload?: StageAdvancePayload) => Promise<unknown> | void;
  onUndo: () => Promise<unknown> | void;
};

export default function StageUpdateBar({
  record,
  canAdvance,
  canUndo,
  onAdvance,
  onUndo,
}: StageUpdateBarProps) {
  const [servedOpen, setServedOpen] = useState(false);
  const [proofOpen, setProofOpen] = useState(false);
  const next = nextIncompleteStage(record);
  const action = nextStageAction(record);
  const lastIndex = lastCompletedStageIndex(record);
  const lastTitle = lastIndex > 0 ? record.stages[lastIndex].title : null;

  if (!canAdvance) {
    if (next) {
      return (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Only the assigned officer ({record.assignedPoliceName}) can update stages.
        </p>
      );
    }
    return null;
  }

  const handleMark = () => {
    if (action === 'served-choice') {
      setServedOpen(true);
      return;
    }
    if (action === 'proof-upload') {
      setProofOpen(true);
      return;
    }
    if (action === 'simple') void onAdvance();
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {next && (
          <button
            onClick={handleMark}
            className="rounded-lg bg-[#075e51] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#00483f]"
          >
            {action === 'proof-upload' ? 'Upload proof' : `Mark: ${next.title}`}
          </button>
        )}
        {canUndo && lastTitle && (
          <button
            onClick={() => void onUndo()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Undo: {lastTitle}
          </button>
        )}
      </div>

      {servedOpen && (
        <ServedMethodModal
          personName={record.personName}
          onClose={() => setServedOpen(false)}
          onConfirm={(servedDetails) => {
            setServedOpen(false);
            void onAdvance({ servedDetails });
          }}
        />
      )}
      {proofOpen && (
        <ProofUploadModal
          record={record}
          onClose={() => setProofOpen(false)}
          onConfirm={(serviceProof) => {
            setProofOpen(false);
            void onAdvance({ serviceProof });
          }}
        />
      )}
    </>
  );
}
