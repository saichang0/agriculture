"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Customer } from "@/lib/customers-queries";

interface CustomerFormDialogProps {
  open: boolean;
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (values: { name: string; phone: string; address: string | null }) => void;
}

export function CustomerFormDialog({
  open,
  customer,
  loading,
  error,
  onClose,
  onSave,
}: CustomerFormDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (open) {
      setName(customer?.name ?? "");
      setPhone(customer?.phone ?? "");
      setAddress(customer?.address ?? "");
    }
  }, [open, customer]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onSave({ name: name.trim(), phone: phone.trim(), address: address.trim() || null });
  }

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col overflow-hidden rounded-card border border-border bg-surface shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {customer ? "ແກ້ໄຂລູກຄ້າ" : "ເພີ່ມລູກຄ້າ"}
          </h2>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <Input
            autoFocus
            label="ຊື່ລູກຄ້າ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ຊື່ ແລະ ນາມສະກຸນ"
          />
          <Input
            label="ເບີໂທ"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="020 xxxxxxxx"
          />
          <Input
            label="ທີ່ຢູ່ (ບໍ່ບັງຄັບ)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="ບ້ານ, ເມືອງ"
          />
          {error && <span className="text-xs text-danger">{error}</span>}
        </div>

        <div className="flex gap-3 border-t border-border p-5 pt-4">
          <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            ຍົກເລີກ
          </Button>
          <Button type="submit" fullWidth disabled={loading || !name.trim() || !phone.trim()}>
            {loading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
          </Button>
        </div>
      </form>
    </div>
  );
}
