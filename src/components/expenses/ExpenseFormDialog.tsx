"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Expense } from "@/lib/expenses-queries";

interface ExpenseFormDialogProps {
  open: boolean;
  expense: Expense | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (values: { title: string; type: "EXPENSE" | "INCOME"; amount: number }) => void;
}

export function ExpenseFormDialog({
  open,
  expense,
  loading,
  error,
  onClose,
  onSave,
}: ExpenseFormDialogProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amountStr, setAmountStr] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(expense?.title ?? "");
      setType(expense?.type ?? "EXPENSE");
      setAmountStr(expense ? String(expense.amount) : "");
    }
  }, [open, expense]);

  if (!open) return null;

  const amount = Number(amountStr) || 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;
    onSave({ title: title.trim(), type, amount });
  }

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col overflow-hidden rounded-card border border-border bg-surface shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {expense ? "ແກ້ໄຂລາຍການ" : "ເພີ່ມລາຍການ"}
          </h2>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          {/* Type tabs */}
          <div className="flex rounded-control border border-border p-1">
            <button
              type="button"
              onClick={() => setType("INCOME")}
              className={`flex-1 rounded-control py-2 text-sm font-medium transition-colors ${
                type === "INCOME" ? "bg-success text-white" : "text-text-secondary hover:bg-surface-muted"
              }`}
            >
              ລາຍຮັບ
            </button>
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={`flex-1 rounded-control py-2 text-sm font-medium transition-colors ${
                type === "EXPENSE" ? "bg-danger text-white" : "text-text-secondary hover:bg-surface-muted"
              }`}
            >
              ລາຍຈ່າຍ
            </button>
          </div>

          <Input
            autoFocus
            label="ຫົວຂໍ້"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === "INCOME" ? "ເຊັ່ນ: ເງິນລົງທຶນເພີ່ມ" : "ເຊັ່ນ: ຄ່າໄຟ"}
          />
          <NumberInput label="ຈຳນວນເງິນ (ກີບ)" value={amountStr} onChange={setAmountStr} placeholder="0" />
          {error && <span className="text-xs text-danger">{error}</span>}
        </div>

        <div className="flex gap-3 border-t border-border p-5 pt-4">
          <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            ຍົກເລີກ
          </Button>
          <Button type="submit" fullWidth disabled={loading || !title.trim() || amount <= 0}>
            {loading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
          </Button>
        </div>
      </form>
    </div>
  );
}
