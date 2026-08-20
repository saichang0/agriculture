"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import {
  CUSTOMERS_PAGE_DATA,
  CREATE_CUSTOMER,
  DELETE_CUSTOMER,
  Customer,
} from "@/lib/customers-queries";

function formatMoney(n: number) {
  return n.toLocaleString("lo-LA");
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}

export default function CustomersPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery(CUSTOMERS_PAGE_DATA, {
    fetchPolicy: "cache-and-network",
  });

  const [createCustomer, { loading: creating }] = useMutation(CREATE_CUSTOMER, {
    refetchQueries: [{ query: CUSTOMERS_PAGE_DATA }],
  });
  const [deleteCustomer, { loading: deleting }] = useMutation(DELETE_CUSTOMER, {
    refetchQueries: [{ query: CUSTOMERS_PAGE_DATA }],
  });

  const [search, setSearch] = useState("");
  const [showOnlyDebt, setShowOnlyDebt] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Customer | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const customers = useMemo(
    () => [...(data?.customers ?? [])].sort((a, b) => b.debt - a.debt),
    [data]
  );

  const totalDebt = customers.reduce((sum, c) => sum + c.debt, 0);
  const debtCustomerCount = customers.filter((c) => c.debt > 0).length;

  const filtered = customers.filter((c) => {
    if (showOnlyDebt && c.debt <= 0) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  function showToast(message: string) {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 2500);
  }

  async function handleSaveCustomer(values: { name: string; phone: string; address: string | null }) {
    setFormError(null);
    try {
      await createCustomer({ variables: { input: values } });
      showToast("ເພີ່ມລູກຄ້າສຳເລັດ");
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "ບໍ່ສາມາດບັນທຶກໄດ້");
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete) return;
    await deleteCustomer({ variables: { id: toDelete.id } });
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
          <h1 className="text-2xl font-semibold text-text-primary">ລູກຄ້າ & ໜີ້ຄ້າງ</h1>
          <p className="mt-1 text-sm text-text-secondary">
            ຈັດການຂໍ້ມູນລູກຄ້າ ແລະ ຕິດຕາມໜີ້ຄ້າງທັງໝົດຂອງຮ້ານ
          </p>
        </div>
        <Button
          icon={<span className="text-lg leading-none">+</span>}
          onClick={() => {
            setFormError(null);
            setFormOpen(true);
          }}
        >
          ເພີ່ມລູກຄ້າ
        </Button>
      </div>

      <div className="flex gap-4">
        <StatCard label="ລູກຄ້າທັງໝົດ" value={customers.length} />
        <StatCard
          label="ລູກຄ້າຄ້າງໜີ້"
          value={debtCustomerCount}
          tone={debtCustomerCount > 0 ? "warning" : "default"}
        />
        <StatCard
          label="ຍອດໜີ້ຄ້າງທັງໝົດ"
          value={`${formatMoney(totalDebt)} ກີບ`}
          tone={totalDebt > 0 ? "danger" : "default"}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="ຄົ້ນຫາຊື່ ຫຼື ເບີໂທ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowOnlyDebt((v) => !v)}
          className={`h-11 shrink-0 rounded-control border px-4 text-sm font-medium transition-colors ${
            showOnlyDebt
              ? "border-danger bg-danger-bg text-danger"
              : "border-border bg-surface text-text-secondary hover:bg-surface-muted"
          }`}
        >
          ສະເພາະຄ້າງໜີ້
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={customers.length === 0 ? "ຍັງບໍ່ມີລູກຄ້າ" : "ບໍ່ພົບລູກຄ້າທີ່ຄົ້ນຫາ"}
          description={customers.length === 0 ? "ເລີ່ມຕົ້ນໂດຍການເພີ່ມລູກຄ້າອັນທຳອິດ" : undefined}
          action={
            customers.length === 0 ? (
              <Button onClick={() => setFormOpen(true)}>ເພີ່ມລູກຄ້າ</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="px-4 py-3 font-medium">ຊື່ລູກຄ້າ</th>
                <th className="px-4 py-3 font-medium">ເບີໂທ</th>
                <th className="px-4 py-3 font-medium">ທີ່ຢູ່</th>
                <th className="w-40 px-4 py-3 font-medium">ໜີ້ຄ້າງ</th>
                <th className="w-28 px-4 py-3 font-medium">ສະຖານະ</th>
                <th className="w-16 px-4 py-3 font-medium text-right">ຈັດການ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-muted"
                  onClick={() => router.push(`/customers/${c.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-text-primary">{c.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.phone}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.address ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className={c.debt > 0 ? "font-medium text-danger" : "text-text-secondary"}>
                      {formatMoney(c.debt)} ກີບ
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.debt > 0 ? <Badge tone="danger">ຄ້າງໜີ້</Badge> : <Badge tone="success">ບໍ່ຄ້າງ</Badge>}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setToDelete(c)}
                        className="flex h-8 w-8 items-center justify-center rounded-control text-text-secondary transition-colors hover:bg-danger-bg hover:text-danger"
                        title="ລຶບ"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CustomerFormDialog
        open={formOpen}
        customer={null}
        loading={creating}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveCustomer}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="ລຶບລູກຄ້າ"
        description={toDelete ? `ທ່ານຕ້ອງການລຶບ "${toDelete.name}" ແທ້ບໍ່? ບໍ່ສາມາດກູ້ຄືນໄດ້.` : undefined}
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
