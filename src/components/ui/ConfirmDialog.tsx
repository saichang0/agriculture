"use client";

import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "ຢືນຢັນ",
  cancelLabel = "ຍົກເລີກ",
  variant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-sm rounded-card border border-border bg-surface p-6 shadow-lg"
        role="alertdialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {description && <p className="mt-2 text-sm text-text-secondary">{description}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "ກຳລັງດຳເນີນການ..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
