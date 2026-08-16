"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { DateRangeFilter, DateRange } from "@/components/ui/DateRangeFilter";
import { DamagedProductFormDialog } from "@/components/damaged/DamagedProductFormDialog";
import { PRODUCTS_PAGE_DATA } from "@/lib/products-queries";
import {
  DAMAGED_PRODUCTS_DATA,
  CREATE_DAMAGED_PRODUCT,
  DELETE_DAMAGED_PRODUCT,
  DamagedProduct,
} from "@/lib/damaged-queries";

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

export default function ReportsDamagedPage() {
  const { data, loading, error } = useQuery(DAMAGED_PRODUCTS_DATA, {
    fetchPolicy: "cache-and-network",
  });
  const { data: productsData } = useQuery(PRODUCTS_PAGE_DATA);

  const [createDamagedProduct, { loading: creating }] = useMutation(CREATE_DAMAGED_PRODUCT, {
    refetchQueries: [{ query: DAMAGED_PRODUCTS_DATA }, { query: PRODUCTS_PAGE_DATA }],
  });
  const [deleteDamagedProduct, { loading: deleting }] = useMutation(DELETE_DAMAGED_PRODUCT, {
    refetchQueries: [{ query: DAMAGED_PRODUCTS_DATA }, { query: PRODUCTS_PAGE_DATA }],
  });

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<DamagedProduct | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const productById = useMemo(() => {
    const map = new Map<string, string>();
    productsData?.products.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [productsData]);

  const sorted = useMemo(() => {
    const list = [...(data?.damagedProducts ?? [])];
    list.sort((a, b) => Number(b.date) - Number(a.date));
    return list;
  }, [data]);

  const dateFiltered = useMemo(() => {
    if (!dateRange.from && !dateRange.to) return sorted;
    return sorted.filter((d) => {
      const dStr = dateStr(d.date);
      if (dateRange.from && dStr < dateRange.from) return false;
      if (dateRange.to && dStr > dateRange.to) return false;
      return true;
    });
  }, [sorted, dateRange]);

  const filtered = dateFiltered.filter((d) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const productName = productById.get(d.productId) ?? "";
    return productName.toLowerCase().includes(q) || d.reason.toLowerCase().includes(q);
  });

  const totalLoss = dateFiltered.reduce((sum, d) => sum + d.costPrice * d.quantity, 0);
  const totalQuantity = dateFiltered.reduce((sum, d) => sum + d.quantity, 0);

  function showToast(message: string) {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 2500);
  }

  async function handleSave(values: {
    productId: string;
    quantity: number;
    reason: string;
    note: string | null;
  }) {
    setFormError(null);
    try {
      await createDamagedProduct({ variables: { input: values } });
      showToast("ບັນທຶກສິນຄ້າເສຍຫາຍສຳເລັດ");
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "ບໍ່ສາມາດບັນທຶກໄດ້");
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete) return;
    await deleteDamagedProduct({ variables: { id: toDelete.id } });
    setToDelete(null);
  }

  if (loading && !data) return <LoadingState />;

  if (error) {
    return (
      <div className="p-8">
        <EmptyState title="ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້" description={error.message} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">ລາຍງານ - ສິນຄ້າເສຍຫາຍ</h1>
          <p className="mt-1 text-sm text-text-secondary">
            ບັນທຶກສິນຄ້າທີ່ເສຍຫາຍ ໝົດອາຍຸ ຫຼືໃຊ້ບໍ່ໄດ້ — ຫັກສະຕັອກອອກອັດຕະໂນມັດ
          </p>
        </div>
        <Button icon={<span className="text-lg leading-none">+</span>} onClick={() => { setFormError(null); setFormOpen(true); }}>
          ເພີ່ມລາຍການ
        </Button>
      </div>

      <div className="flex gap-4">
        <StatCard label="ຈຳນວນລາຍການ" value={dateFiltered.length} />
        <StatCard label="ຈຳນວນສິນຄ້າ" value={totalQuantity} />
        <StatCard label="ມູນຄ່າຄວາມເສຍຫາຍ" value={`${formatMoney(totalLoss)} ກີບ`} tone="danger" />
      </div>

      <div className="flex items-center gap-3">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ ຫຼື ສາເຫດ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={sorted.length === 0 ? "ຍັງບໍ່ມີລາຍການ" : "ບໍ່ພົບລາຍການທີ່ຄົ້ນຫາ"}
          description={sorted.length === 0 ? "ເລີ່ມຕົ້ນໂດຍການເພີ່ມລາຍການທຳອິດ" : undefined}
          action={sorted.length === 0 ? <Button onClick={() => setFormOpen(true)}>ເພີ່ມລາຍການ</Button> : undefined}
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-180 text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="px-4 py-3 font-medium">ວັນທີ</th>
                <th className="px-4 py-3 font-medium">ສິນຄ້າ</th>
                <th className="w-24 px-4 py-3 font-medium">ຈຳນວນ</th>
                <th className="px-4 py-3 font-medium">ສາເຫດ</th>
                <th className="w-36 px-4 py-3 font-medium text-right">ມູນຄ່າເສຍຫາຍ</th>
                <th className="w-16 px-4 py-3 font-medium text-right">ຈັດການ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                  <td className="px-4 py-3 text-text-secondary">{formatDateTime(d.date)}</td>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {productById.get(d.productId) ?? "ສິນຄ້າຖືກລຶບແລ້ວ"}
                  </td>
                  <td className="px-4 py-3 text-text-primary">{d.quantity}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {d.reason}
                    {d.note && <span className="block text-xs text-text-muted">{d.note}</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-danger">
                    {formatMoney(d.costPrice * d.quantity)} ກີບ
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setToDelete(d)}
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

      <DamagedProductFormDialog
        open={formOpen}
        products={productsData?.products ?? []}
        loading={creating}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="ລຶບລາຍການ"
        description={
          toDelete
            ? `ທ່ານຕ້ອງການລຶບລາຍການນີ້ແທ້ບໍ່? ສະຕັອກຈະຖືກເພີ່ມກັບຄືນ ${toDelete.quantity} ຫົວໜ່ວຍ.`
            : undefined
        }
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
