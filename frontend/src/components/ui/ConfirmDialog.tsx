import React from 'react';
import { Button } from './button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'KONFIRMASI',
  cancelText = 'BATAL',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface border border-border w-full max-w-sm rounded-sm shadow-modal overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-surface-subtle">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-tight">{title}</h2>
        </div>
        <div className="p-5">
          <p className="text-[13px] text-text-secondary leading-relaxed">
            {message}
          </p>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2 bg-surface-subtle">
          <Button variant="ghost" onClick={onCancel} className="font-mono text-xs">
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} className="font-mono text-xs">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
