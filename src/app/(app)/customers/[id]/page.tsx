"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { DebtPaymentDialog } from "@/components/customers/DebtPaymentDialog";
import {
  CUSTOMER_BY_ID,
  SALES_BY_CUSTOMER,
  UPDATE_CUSTOMER,
  CREATE_DEBT_PAYMENT,
  Sale,
} from "@/lib/customers-queries";

function formatMoney(n: number) {
  return n.toLocaleString("lo-LA");
}

// saleDate/paymentDate come from the backend as Unix seconds stringified
// (e.g. "1786453118"), NOT an ISO date string — must multiply by 1000 and
// parse as a number, or Date() silently produces an Invalid Date.
function formatDateTime(unixSecondsStr: string) {
  const seconds = Number(unixSecondsStr);
  if (Number.isNaN(seconds)) return unixSecondsStr;
  const d = new Date(seconds * 1000);
  const datePart = `${d.getMonth() + 1},${d.getDate()}, ${d.getFullYear()}`;
  const timePart = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${datePart} ${timePart}`;
}

// dueDate is a plain "YYYY-MM-DD" string (from a date input), unlike saleDate/paymentDate.
function formatDueDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getMonth() + 1},${d.getDate()}, ${d.getFullYear()}`;
}

function isDueTodayOrPast(dateStr: string) {
  const due = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due.getTime() <= today.getTime();
}

function statusBadge(status: string) {
  if (status === "PAID") return <Badge tone="success">ຈ່າຍຄົບ</Badge>;
  if (status === "PARTIAL") return <Badge tone="warning">ຈ່າຍບາງສ່ວນ</Badge>;
  return <Badge tone="danger">ຄ້າງໜີ້</Badge>;
}

type StatusFilter = "ALL" | "UNPAID" | "PARTIAL" | "PAID";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "ທັງໝົດ" },
  { key: "UNPAID", label: "ຄ້າງໜີ້" },
  { key: "PARTIAL", label: "ຈ່າຍບາງສ່ວນ" },
  { key: "PAID", label: "ຈ່າຍຄົບ" },
];

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const customerId = params.id;

  const { data: customerData, loading: customerLoading } = useQuery(CUSTOMER_BY_ID, {
    variables: { id: customerId },
    fetchPolicy: "cache-and-network",
  });
  const { data: salesData, loading: salesLoading } = useQuery(SALES_BY_CUSTOMER, {
    variables: { customerId },
    fetchPolicy: "cache-and-network",
  });

  const [updateCustomer, { loading: updating }] = useMutation(UPDATE_CUSTOMER, {
    refetchQueries: [{ query: CUSTOMER_BY_ID, variables: { id: customerId } }],
  });
  const [createDebtPayment, { loading: paying }] = useMutation(CREATE_DEBT_PAYMENT);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [payingSale, setPayingSale] = useState<Sale | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const customer = customerData?.customer ?? null;

  const sales = useMemo(() => {
    const list = [...(salesData?.salesByCustomer ?? [])];
    list.sort((a, b) => Number(b.saleDate) - Number(a.saleDate));
    return list;
  }, [salesData]);

  const filteredSales = sales.filter((s) => {
    if (statusFilter === "ALL") return true;
    return s.paymentStatus === statusFilter;
  });

  const dueReminders = sales.filter((s) => s.debt > 0 && s.dueDate && isDueTodayOrPast(s.dueDate));

  function showToast(message: string) {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 2500);
  }

  async function handleSaveCustomer(values: { name: string; phone: string; address: string | null }) {
    setFormError(null);
    try {
      await updateCustomer({ variables: { id: customerId, input: values } });
      showToast("ແກ້ໄຂຂໍ້ມູນລູກຄ້າສຳເລັດ");
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "ບໍ່ສາມາດບັນທຶກໄດ້");
    }
  }

  async function handleConfirmPayment(amount: number) {
    if (!payingSale) return;
    setPayError(null);
    try {
      await createDebtPayment({
        variables: { input: { saleId: payingSale.id, amountPaid: amount } },
        refetchQueries: [
          { query: CUSTOMER_BY_ID, variables: { id: customerId } },
          { query: SALES_BY_CUSTOMER, variables: { customerId } },
        ],
        awaitRefetchQueries: true,
      });
      setPayingSale(null);
      showToast("ບັນທຶກການຊຳລະໜີ້ສຳເລັດ");
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "ບໍ່ສາມາດບັນທຶກໄດ້");
    }
  }

  if (customerLoading && !customerData) return <LoadingState />;

  if (!customer) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState title="ບໍ່ພົບຂໍ້ມູນລູກຄ້າ" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-4 sm:p-6">
      <button
        type="button"
        onClick={() => router.push("/customers")}
        className="flex w-fit items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
      >
        ← ກັບໄປລາຍຊື່ລູກຄ້າ
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">{customer.name}</h1>
          <p className="mt-1 text-sm text-text-secondary">{customer.phone}</p>
          {customer.address && <p className="mt-0.5 text-sm text-text-secondary">{customer.address}</p>}
        </div>
        <Button variant="secondary" onClick={() => { setFormError(null); setFormOpen(true); }}>
          ແກ້ໄຂຂໍ້ມູນ
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-card border border-border bg-surface-muted px-5 py-4">
        <span className="text-sm font-medium text-text-secondary">ໜີ້ຄ້າງທັງໝົດ</span>
        <span className={`text-2xl font-semibold ${customer.debt > 0 ? "text-danger" : "text-success"}`}>
          {formatMoney(customer.debt)} ກີບ
        </span>
      </div>

      {dueReminders.length > 0 && (
        <div className="flex flex-col gap-2 rounded-card border border-warning bg-warning-bg p-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5 shrink-0 text-warning">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <span className="text-sm font-semibold text-warning">
              ຮອດກຳນົດຈ່າຍແລ້ວ — ໂທຫາລູກຄ້າເພື່ອຕິດຕາມໜີ້
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {dueReminders.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">
                  {s.code} — ຄ້າງ {formatMoney(s.debt)} ກີບ (ກຳນົດ {formatDueDate(s.dueDate!)})
                </span>
                <Button size="sm" onClick={() => { setPayError(null); setPayingSale(s); }}>
                  ຮັບຊຳລະ
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatusFilter(f.key)}
            className={`rounded-pill border px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === f.key
                ? "border-primary bg-primary text-primary-text"
                : "border-border bg-surface text-text-secondary hover:bg-surface-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sales history */}
      <div className="flex flex-col gap-2">
        {salesLoading && !salesData ? (
          <LoadingState />
        ) : filteredSales.length === 0 ? (
          <EmptyState title="ບໍ່ພົບປະຫວັດການຊື້" />
        ) : (
          filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-text-primary">{sale.code}</span>
                  <span className="text-xs text-text-secondary">{formatDateTime(sale.saleDate)}</span>
                </div>
                {statusBadge(sale.paymentStatus)}
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-text-secondary">
                  ຍອດລວມ <span className="text-text-primary">{formatMoney(sale.total)} ກີບ</span>
                </span>
                <span className="text-text-secondary">
                  ຈ່າຍແລ້ວ <span className="text-text-primary">{formatMoney(sale.paid)} ກີບ</span>
                </span>
                {sale.dueDate && sale.debt > 0 && (
                  <span className={isDueTodayOrPast(sale.dueDate) ? "font-medium text-warning" : "text-text-secondary"}>
                    ກຳນົດຈ່າຍ {formatDueDate(sale.dueDate)}
                  </span>
                )}
              </div>
              {sale.debt > 0 && (
                <div className="flex items-center justify-between rounded-control bg-danger-bg px-3.5 py-2.5">
                  <span className="text-sm font-medium text-danger">ຄ້າງ {formatMoney(sale.debt)} ກີບ</span>
                  <Button size="sm" onClick={() => { setPayError(null); setPayingSale(sale); }}>
                    ຮັບຊຳລະ
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <CustomerFormDialog
        open={formOpen}
        customer={customer}
        loading={updating}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveCustomer}
      />

      <DebtPaymentDialog
        open={payingSale !== null}
        sale={payingSale}
        loading={paying}
        error={payError}
        onClose={() => setPayingSale(null)}
        onConfirm={handleConfirmPayment}
      />

      {successToast && <Toast message={successToast} tone="success" />}
    </div>
  );
}
