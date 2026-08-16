"use client";

import { useEffect, useState } from "react";
import { Customer } from "@/lib/sales-queries";
import { CustomerPickerDialog } from "./CustomerPickerDialog";

interface CheckoutDialogProps {
  open: boolean;
  total: number;
  customers: Customer[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (opts: {
    customerId: string | null;
    paid: number;
    paymentMethod: string | null;
    dueDate: string | null;
  }) => void;
  onCreateCustomer: (name: string, phone: string) => Promise<Customer>;
}

function formatMoney(n: number) {
  return n.toLocaleString("lo-LA");
}

const NUMPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"];

export function CheckoutDialog({
  open,
  total,
  customers,
  loading,
  error,
  onClose,
  onConfirm,
  onCreateCustomer,
}: CheckoutDialogProps) {
  const [paidStr, setPaidStr] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">("CASH");
  const [pickingCustomer, setPickingCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dueDate, setDueDate] = useState("");
  // Only true once the cashier explicitly presses "ຄ້າງໜີ້" — never inferred
  // just from the amount typed, so the dialog stays neutral on open.
  const [debtMode, setDebtMode] = useState(false);

  // Reset all local state whenever the dialog transitions from closed to open,
  // so a previous sale's leftover amount/customer never carries into the next one.
  useEffect(() => {
    if (open) {
      setPaidStr("");
      setPaymentMethod("CASH");
      setPickingCustomer(false);
      setSelectedCustomer(null);
      setDueDate("");
      setDebtMode(false);
    }
  }, [open]);

  if (!open) return null;

  const paid = Math.min(Number(paidStr) || 0, total);
  const change = Math.max((Number(paidStr) || 0) - total, 0);
  const debt = Math.max(total - paid, 0);

  function pressKey(key: string) {
    if (key === "C") {
      setPaidStr("");
      return;
    }
    if (key === "⌫") {
      setPaidStr((prev) => prev.slice(0, -1));
      return;
    }
    setPaidStr((prev) => {
      const next = prev + key;
      return next.replace(/^0+(?=\d)/, "");
    });
  }

  function handleReceivePayment() {
    // The customer is paying in full regardless of exact cash tendered — the numpad
    // here is only used to calculate change, not to determine what gets recorded.
    onConfirm({ customerId: null, paid: total, paymentMethod, dueDate: null });
  }

  function handleExactAmount() {
    setPaidStr(String(total));
  }

  function handleStartDebt() {
    setDebtMode(true);
    if (!selectedCustomer) {
      setPickingCustomer(true);
    }
  }

  function handleConfirmDebt() {
    if (!selectedCustomer) {
      setPickingCustomer(true);
      return;
    }
    onConfirm({
      customerId: selectedCustomer.id,
      paid,
      paymentMethod,
      dueDate: dueDate || null,
    });
  }

  function handleCustomerSelected(customer: Customer) {
    setSelectedCustomer(customer);
    setPickingCustomer(false);
  }

  return (
    <>
      <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 p-4">
        <div className="flex w-full max-w-md flex-col overflow-hidden rounded-card border border-border bg-surface shadow-lg">
          {/* Header: total + close */}
          <div className="flex items-center justify-between bg-sidebar-bg px-5 py-4 text-white">
            <span className="text-sm text-white/70">ຍອດລວມ</span>
            <span className="text-2xl font-semibold">{formatMoney(total)} ກີບ</span>
            <button type="button" onClick={onClose} className="ml-3 text-white/70 hover:text-white">
              ✕
            </button>
          </div>

          {/* Payment method tabs */}
          <div className="flex border-b border-border">
            {(["CASH", "TRANSFER"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPaymentMethod(m)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  paymentMethod === m
                    ? "border-b-2 border-primary text-primary"
                    : "text-text-secondary hover:bg-surface-muted"
                }`}
              >
                {m === "CASH" ? "ເງິນສົດ" : "ໂອນ"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 p-5">
            {debtMode ? (
              <>
                <span className="text-sm font-medium text-text-secondary">
                  ຈຳນວນທີ່ຈ່າຍແລ້ວ (ບໍ່ບັງຄັບ)
                </span>

                {/* Amount display */}
                <div className="flex h-14 items-center justify-end rounded-control border border-border bg-surface-muted px-4">
                  <span className="text-2xl font-semibold text-text-primary">
                    {paidStr ? formatMoney(Number(paidStr) || 0) : "0"}
                  </span>
                </div>

                {/* Numpad */}
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

                {/* Live summary */}
                <div className="flex flex-col gap-1.5 rounded-control border border-border bg-surface-muted px-3.5 py-3 text-sm">
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>ຍອດລວມ</span>
                    <span className="text-text-primary">{formatMoney(total)} ກີບ</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>ຈ່າຍແລ້ວ</span>
                    <span className="text-text-primary">{formatMoney(paid)} ກີບ</span>
                  </div>
                  <div className="flex items-center justify-between font-medium text-warning">
                    <span>ຄ້າງໜີ້</span>
                    <span>{formatMoney(debt)} ກີບ</span>
                  </div>
                </div>

                {/* Customer (required in debt mode) */}
                <button
                  type="button"
                  onClick={() => setPickingCustomer(true)}
                  className="flex items-center justify-between rounded-control border border-warning bg-warning-bg px-3.5 py-2.5 text-left text-sm hover:bg-warning-bg/80"
                >
                  {selectedCustomer ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-text-primary">{selectedCustomer.name}</span>
                      <span className="text-xs text-text-secondary">{selectedCustomer.phone}</span>
                    </div>
                  ) : (
                    <span className="font-medium text-warning">ເລືອກລູກຄ້າ (ຈຳເປັນ)</span>
                  )}
                  <span className="text-xs text-text-secondary">ປ່ຽນ</span>
                </button>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">
                    ວັນນັດຈ່າຍ (ບໍ່ບັງຄັບ)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">ຍອດລວມ</span>
                  <span className="text-2xl font-semibold text-text-primary">
                    {formatMoney(total)} ກີບ
                  </span>
                </div>

                <span className="text-sm font-medium text-text-secondary">ຮັບເງິນມາ</span>

                {/* Amount tendered display */}
                <div className="flex h-14 items-center justify-end rounded-control border border-border bg-surface-muted px-4">
                  <span className="text-2xl font-semibold text-text-primary">
                    {paidStr ? formatMoney(Number(paidStr) || 0) : "0"}
                  </span>
                </div>

                {/* ພໍດີ shortcut */}
                <button
                  type="button"
                  onClick={handleExactAmount}
                  className="rounded-control border border-primary py-2.5 text-sm font-medium text-primary hover:bg-surface-muted"
                >
                  ພໍດີ
                </button>

                {/* Numpad */}
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

                {/* Live change calculation */}
                <div
                  className={`flex items-center justify-between rounded-control border px-3.5 py-3 text-sm font-medium ${
                    change > 0
                      ? "border-success bg-success-bg"
                      : "border-border bg-surface-muted"
                  }`}
                >
                  <span className={change > 0 ? "text-success" : "text-text-secondary"}>
                    ເງິນທອນ
                  </span>
                  <span className={`text-lg ${change > 0 ? "text-success" : "text-text-primary"}`}>
                    {formatMoney(change)} ກີບ
                  </span>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">{error}</div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex gap-3 border-t border-border p-5 pt-4">
            {debtMode ? (
              <>
                <button
                  type="button"
                  onClick={() => setDebtMode(false)}
                  disabled={loading}
                  className="flex-1 rounded-control border border-border py-3 text-sm font-medium text-text-secondary hover:bg-surface-muted disabled:opacity-60"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDebt}
                  disabled={loading}
                  className="flex-1 rounded-control bg-danger py-3 text-sm font-medium text-white hover:bg-danger/90 disabled:opacity-60"
                >
                  {loading ? "ກຳລັງບັນທຶກ..." : `ບັນທຶກ — ຄ້າງ ${formatMoney(debt)} ກີບ`}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleStartDebt}
                  disabled={loading}
                  className="flex-1 rounded-control border border-danger py-3 text-sm font-medium text-danger hover:bg-danger-bg disabled:opacity-60"
                >
                  ຄ້າງໜີ້
                </button>
                <button
                  type="button"
                  onClick={handleReceivePayment}
                  disabled={loading}
                  className="flex-1 rounded-control bg-primary py-3 text-sm font-medium text-primary-text hover:bg-primary-hover disabled:opacity-60"
                >
                  {loading ? "ກຳລັງບັນທຶກ..." : "ຮັບເງິນ"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <CustomerPickerDialog
        open={pickingCustomer}
        customers={customers}
        onClose={() => setPickingCustomer(false)}
        onSelect={handleCustomerSelected}
        onCreateCustomer={onCreateCustomer}
      />
    </>
  );
}
