"use client";

import { useState } from "react";
import { Customer } from "@/lib/sales-queries";

interface CustomerPickerDialogProps {
  open: boolean;
  customers: Customer[];
  onClose: () => void;
  onSelect: (customer: Customer) => void;
  onCreateCustomer: (name: string, phone: string) => Promise<Customer>;
}

export function CustomerPickerDialog({
  open,
  customers,
  onClose,
  onSelect,
  onCreateCustomer,
}: CustomerPickerDialogProps) {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  async function handleCreate() {
    if (!name.trim() || !phone.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await onCreateCustomer(name.trim(), phone.trim());
      onSelect(created);
      setAdding(false);
      setName("");
      setPhone("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ບໍ່ສາມາດເພີ່ມລູກຄ້າໄດ້");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-card border border-border bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">ເລືອກລູກຄ້າ (ຄ້າງໜີ້)</h2>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          {adding ? (
            <div className="flex flex-col gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ຊື່ລູກຄ້າ"
                className="h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-text-primary outline-none focus:border-primary"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="ເບີໂທ"
                className="h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-text-primary outline-none focus:border-primary"
              />
              {error && <span className="text-xs text-danger">{error}</span>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setError(null);
                  }}
                  className="rounded-control px-3 py-2 text-sm text-text-secondary hover:bg-surface-muted"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={saving || !name.trim() || !phone.trim()}
                  className="rounded-control bg-primary px-3 py-2 text-sm text-primary-text disabled:opacity-60"
                >
                  {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ຄົ້ນຫາຊື່ ຫຼື ເບີໂທ..."
                  className="h-11 flex-1 rounded-control border border-border bg-surface px-3.5 text-sm text-text-primary outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="shrink-0 rounded-control bg-primary px-4 text-sm font-medium text-primary-text hover:bg-primary-hover"
                >
                  + ເພີ່ມໃໝ່
                </button>
              </div>

              <div className="flex max-h-80 flex-col overflow-y-auto rounded-control border border-border">
                {filtered.length === 0 ? (
                  <p className="p-4 text-center text-sm text-text-secondary">ບໍ່ພົບລູກຄ້າ</p>
                ) : (
                  filtered.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onSelect(c)}
                      className="flex items-center justify-between border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface-muted"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-primary">{c.name}</span>
                        <span className="text-xs text-text-secondary">{c.phone}</span>
                      </div>
                      {c.debt > 0 && (
                        <span className="text-xs text-warning">ຄ້າງ {c.debt.toLocaleString("lo-LA")}</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
