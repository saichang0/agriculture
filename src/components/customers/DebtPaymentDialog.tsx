"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Sale } from "@/lib/customers-queries";

interface DebtPaymentDialogProps {
  open: boolean;
  sale: Sale | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

function formatMoney(n: number) {
  return n.toLocaleString("lo-LA");
}

const NUMPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"];

export function DebtPaymentDialog({
  open,
  sale,
  loading,
  error,
  onClose,
  onConfirm,
}: DebtPaymentDialogProps) {
  const [amountStr, setAmountStr] = useState("");

  useEffect(() => {
    if (open) setAmountStr("");
  }, [open, sale]);

  if (!open || !sale) return null;

  const amount = Math.min(Number(amountStr) || 0, sale.debt);

  function pressKey(key: string) {
    if (key === "C") {
      setAmountStr("");
      return;
    }
    if (key === "⌫") {
      setAmountStr((prev) => prev.slice(0, -1));
      return;
    }
    setAmountStr((prev) => {
      const next = prev + key;
      return next.replace(/^0+(?=\d)/, "");
    });
  }

  function handlePayFull() {
    setAmountStr(String(sale!.debt));
  }

  function handleSubmit() {
    if (amount <= 0) return;
    onConfirm(amount);
  }

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-card border border-border bg-surface shadow-lg">
        <div className="flex items-center justify-between bg-sidebar-bg px-5 py-4 text-white">
          <div className="flex flex-col">
            <span className="text-sm text-white/70">ບິນ {sale.code}</span>
            <span className="text-lg font-semibold">ຄ້າງ {formatMoney(sale.debt)} ກີບ</span>
          </div>
          <button type="button" onClick={onClose} className="text-white/70 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <span className="text-sm font-medium text-text-secondary">ຈຳນວນທີ່ຮັບຊຳລະ</span>

          <div className="flex h-14 items-center justify-end rounded-control border border-border bg-surface-muted px-4">
            <span className="text-2xl font-semibold text-text-primary">
              {amountStr ? formatMoney(Number(amountStr) || 0) : "0"}
            </span>
          </div>

          <button
            type="button"
            onClick={handlePayFull}
            className="rounded-control border border-primary py-2.5 text-sm font-medium text-primary hover:bg-surface-muted"
          >
            ຊຳລະຄົບ ({formatMoney(sale.debt)})
          </button>

          <div className="grid grid-cols-4 gap-2">
            {NUMPAD_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => pressKey(key)}
                className="flex h-12 items-center justify-center rounded-control border border-border bg-surface text-base font-medium text-text-primary transition-colors hover:bg-surface-muted"
              >
                {key}
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">{error}</div>
          )}
        </div>

        <div className="flex gap-3 border-t border-border p-5 pt-4">
          <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            ຍົກເລີກ
          </Button>
          <Button fullWidth onClick={handleSubmit} disabled={loading || amount <= 0}>
            {loading ? "ກຳລັງບັນທຶກ..." : `ຮັບຊຳລະ ${formatMoney(amount)} ກີບ`}
          </Button>
        </div>
      </div>
    </div>
  );
}
