"use client";

import { useCameraScanner } from "@/lib/useCameraScanner";

interface CameraScannerDialogProps {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function CameraScannerDialog({ open, onClose, onScan }: CameraScannerDialogProps) {
  const { videoRef, error } = useCameraScanner(open, onScan);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 p-4">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-card bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">ສະແກນດ້ວຍກ້ອງ</h2>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary">
            ✕
          </button>
        </div>

        <div className="relative aspect-square w-full bg-black">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          {!error && (
            <div className="pointer-events-none absolute inset-8 rounded-card border-2 border-white/70" />
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white">
              {error}
            </div>
          )}
        </div>

        <p className="px-5 py-4 text-center text-sm text-text-secondary">
          ວາງ barcode ຂອງສິນຄ້າໃຫ້ຢູ່ໃນກອບ
        </p>
      </div>
    </div>
  );
}
