"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { DateRangeFilter, DateRange } from "@/components/ui/DateRangeFilter";
import { ExpenseFormDialog } from "@/components/expenses/ExpenseFormDialog";
import {
  EXPENSES_DATA,
  CREATE_EXPENSE,
  UPDATE_EXPENSE,
  DELETE_EXPENSE,
  Expense,
} from "@/lib/expenses-queries";

function formatMoney(n: number) {
  return n.toLocaleString("lo-LA");
}

function formatDateTime(unixSecondsStr: string) {
  const seconds = Number(unixSecondsStr);
  if (Number.isNaN(seconds)) return unixSecondsStr;
  const d = new Date(seconds * 1000);
  const datePart = `${d.getMonth() + 1},${d.getDate()}, ${d.getFullYear()}`;
  const timePart = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${datePart} ${timePart}`;
}

function dateStr(unixSecondsStr: string) {
  const seconds = Number(unixSecondsStr);
  if (Number.isNaN(seconds)) return "";
  const d = new Date(seconds * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type TypeFilter = "ALL" | "INCOME" | "EXPENSE";

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: "ALL", label: "ທັງໝົດ" },
  { key: "INCOME", label: "ລາຍຮັບ" },
  { key: "EXPENSE", label: "ລາຍຈ່າຍ" },
];

export default function ReportsExpensesPage() {
  const { data, loading, error } = useQuery(EXPENSES_DATA, {
    fetchPolicy: "cache-and-network",
  });
  const [createExpense, { loading: creating }] = useMutation(CREATE_EXPENSE, {
    refetchQueries: [{ query: EXPENSES_DATA }],
  });
  const [updateExpense, { loading: updating }] = useMutation(UPDATE_EXPENSE, {
    refetchQueries: [{ query: EXPENSES_DATA }],
  });
  const [deleteExpense, { loading: deleting }] = useMutation(DELETE_EXPENSE, {
    refetchQueries: [{ query: EXPENSES_DATA }],
  });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Expense | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const list = [...(data?.expenses ?? [])];
    list.sort((a, b) => Number(b.date) - Number(a.date));
    return list;
  }, [data]);

  const dateFiltered = useMemo(() => {
    if (!dateRange.from && !dateRange.to) return sorted;
    return sorted.filter((e) => {
      const d = dateStr(e.date);
      if (dateRange.from && d < dateRange.from) return false;
      if (dateRange.to && d > dateRange.to) return false;
      return true;
    });
  }, [sorted, dateRange]);

  const filtered = dateFiltered.filter((e) => {
    if (typeFilter !== "ALL" && e.type !== typeFilter) return false;
    if (!search.trim()) return true;
    return e.title.toLowerCase().includes(search.trim().toLowerCase());
  });

  const totalIncome = dateFiltered.filter((e) => e.type === "INCOME").reduce((s, e) => s + e.amount, 0);
  const totalExpense = dateFiltered.filter((e) => e.type === "EXPENSE").reduce((s, e) => s + e.amount, 0);
  const net = totalIncome - totalExpense;

  function showToast(message: string) {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 2500);
  }

  function handleOpenCreate() {
    setEditingExpense(null);
    setFormError(null);
    setFormOpen(true);
  }

  function handleOpenEdit(expense: Expense) {
    setEditingExpense(expense);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSave(values: { title: string; type: "EXPENSE" | "INCOME"; amount: number }) {
    setFormError(null);
    try {
      if (editingExpense) {
        await updateExpense({ variables: { id: editingExpense.id, input: values } });
        showToast("ແກ້ໄຂລາຍການສຳເລັດ");
      } else {
        await createExpense({ variables: { input: values } });
        showToast("ເພີ່ມລາຍການສຳເລັດ");
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "ບໍ່ສາມາດບັນທຶກໄດ້");
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete) return;
    await deleteExpense({ variables: { id: toDelete.id } });
    setToDelete(null);
  }

  if (loading && !data) return <LoadingState />;

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState title="ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້" description={error.message} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">ລາຍງານ - ລາຍຮັບ-ລາຍຈ່າຍ</h1>
          <p className="mt-1 text-sm text-text-secondary">
            ບັນທຶກລາຍຮັບ ແລະ ລາຍຈ່າຍອື່ນໆຂອງຮ້ານ ນອກເໜືອຈາກຍອດຂາຍສິນຄ້າ
          </p>
        </div>
        <Button icon={<span className="text-lg leading-none">+</span>} onClick={handleOpenCreate}>
          ເພີ່ມລາຍການ
        </Button>
      </div>

      <div className="flex gap-4">
        <StatCard label="ລາຍຮັບລວມ" value={`${formatMoney(totalIncome)} ກີບ`} />
        <StatCard label="ລາຍຈ່າຍລວມ" value={`${formatMoney(totalExpense)} ກີບ`} tone="warning" />
        <StatCard
          label="ຍອດສຸດທິ"
          value={`${net >= 0 ? "+" : ""}${formatMoney(net)} ກີບ`}
          tone={net < 0 ? "danger" : "default"}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setTypeFilter(f.key)}
              className={`rounded-pill border px-4 py-2 text-sm font-medium transition-colors ${
                typeFilter === f.key
                  ? "border-primary bg-primary text-primary-text"
                  : "border-border bg-surface text-text-secondary hover:bg-surface-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-64">
            <Input
              placeholder="ຄົ້ນຫາຫົວຂໍ້..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={sorted.length === 0 ? "ຍັງບໍ່ມີລາຍການ" : "ບໍ່ພົບລາຍການທີ່ຄົ້ນຫາ"}
          description={sorted.length === 0 ? "ເລີ່ມຕົ້ນໂດຍການເພີ່ມລາຍການທຳອິດ" : undefined}
          action={sorted.length === 0 ? <Button onClick={handleOpenCreate}>ເພີ່ມລາຍການ</Button> : undefined}
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-180 text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="px-4 py-3 font-medium">ວັນທີ</th>
                <th className="px-4 py-3 font-medium">ຫົວຂໍ້</th>
                <th className="w-28 px-4 py-3 font-medium">ປະເພດ</th>
                <th className="w-40 px-4 py-3 font-medium text-right">ຈຳນວນເງິນ</th>
                <th className="w-16 px-4 py-3 font-medium text-right">ຈັດການ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-muted"
                  onClick={() => handleOpenEdit(e)}
                >
                  <td className="px-4 py-3 text-text-secondary">{formatDateTime(e.date)}</td>
                  <td className="px-4 py-3 font-medium text-text-primary">{e.title}</td>
                  <td className="px-4 py-3">
                    {e.type === "INCOME" ? (
                      <Badge tone="success">ລາຍຮັບ</Badge>
                    ) : (
                      <Badge tone="danger">ລາຍຈ່າຍ</Badge>
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      e.type === "INCOME" ? "text-success" : "text-danger"
                    }`}
                  >
                    {e.type === "INCOME" ? "+" : "-"}
                    {formatMoney(e.amount)} ກີບ
                  </td>
                  <td className="px-4 py-3" onClick={(ev) => ev.stopPropagation()}>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setToDelete(e)}
                        className="flex h-8 w-8 items-center justify-center rounded-control text-text-secondary transition-colors hover:bg-danger-bg hover:text-danger"
                        title="ລຶບ"
                      >
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ExpenseFormDialog
        open={formOpen}
        expense={editingExpense}
        loading={creating || updating}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="ລຶບລາຍການ"
        description={toDelete ? `ທ່ານຕ້ອງການລຶບ "${toDelete.title}" ແທ້ບໍ່? ບໍ່ສາມາດກູ້ຄືນໄດ້.` : undefined}
        confirmLabel="ລຶບ"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />

      {successToast && <Toast message={successToast} tone="success" />}
    </div>
  );
}
