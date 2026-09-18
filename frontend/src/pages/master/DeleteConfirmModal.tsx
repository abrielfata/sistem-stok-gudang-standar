import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface DeleteConfirmModalProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  itemName, onConfirm, onCancel, isLoading
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-sm w-full max-w-sm mx-4 shadow-xl">
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-status-danger/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-status-danger" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase font-mono">Konfirmasi Hapus</h3>
              <p className="text-xs text-text-muted mt-1">
                Yakin ingin menghapus barang <span className="font-semibold text-text-primary">"{itemName}"</span>?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>
        </div>
        <div className="px-5 pb-4 flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button variant="ghost" onClick={onCancel} className="font-mono text-xs" disabled={isLoading}>
            BATAL
          </Button>
          <Button variant="danger" onClick={onConfirm} className="font-mono text-xs" disabled={isLoading}>
            {isLoading ? 'MENGHAPUS...' : 'YA, HAPUS'}
          </Button>
        </div>
      </div>
    </div>
  );
};
