import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteSessionModalProps {
  sessionToDelete: string | null;
  onClose: () => void;
  onConfirmDelete: (sessionKey: string) => void;
}

export const DeleteSessionModal: React.FC<DeleteSessionModalProps> = ({
  sessionToDelete,
  onClose,
  onConfirmDelete,
}) => {
  if (!sessionToDelete) return null;

  return (
    <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4 animate-backdrop-fade">
      <div className="bg-surface-1 border border-sale/40 max-w-sm w-full p-5 space-y-4 shadow-2xl animate-modal-pop">
        <div className="flex items-center gap-3 text-sale">
          <div className="w-9 h-9 rounded-full bg-sale-deep/50 border border-sale/40 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-sale" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Delete Workout Session?</h3>
        </div>

        <p className="text-xs text-ink-subtle leading-relaxed">
          Are you sure you want to permanently delete this workout session log ({sessionToDelete})? This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-surface-2 hover:bg-surface-3 text-white text-xs font-semibold uppercase tracking-wider apple-press cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(sessionToDelete);
              onClose();
            }}
            className="px-4 py-2 rounded-full bg-sale hover:bg-sale-deep text-white text-xs font-bold uppercase tracking-wider apple-press cursor-pointer shadow-lg"
          >
            Delete Session
          </button>
        </div>
      </div>
    </div>
  );
};
