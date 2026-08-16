"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery } from "@apollo/client/react";
import { PRODUCTS_PAGE_DATA, DELETE_PRODUCT, Product } from "@/lib/products-queries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

function formatMoney(n: number) {
  return n.toLocaleString("lo-LA");
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  );
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

export default function ProductsPage() {
  const { data, loading, error } = useQuery(PRODUCTS_PAGE_DATA, {
    fetchPolicy: "cache-and-network",
  });
  const [deleteProduct, { loading: deleting }] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [{ query: PRODUCTS_PAGE_DATA }],
  });
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const categoryById = useMemo(() => {
    const map = new Map<string, string>();
    data?.categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [data]);

  const unitById = useMemo(() => {
    const map = new Map<string, string>();
    data?.units.forEach((u) => map.set(u.id, u.name));
    return map;
  }, [data]);

  const products = data?.products ?? [];

  const lowStockCount = products.filter(
    (p) => p.stockQty > 0 && p.stockQty <= p.minStockAlert
  ).length;
  const outOfStockCount = products.filter((p) => p.stockQty <= 0).length;
  const totalStockQty = products.reduce((sum, p) => sum + p.stockQty, 0);

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.barcode ?? "").toLowerCase().includes(q) ||
      (categoryById.get(p.categoryId) ?? "").toLowerCase().includes(q)
    );
  });

  async function handleConfirmDelete() {
    if (!toDelete) return;
    await deleteProduct({ variables: { id: toDelete.id } });
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
          <h1 className="text-2xl font-semibold text-text-primary">ສິນຄ້າ</h1>
          <p className="mt-1 text-sm text-text-secondary">
            ຈັດການສິນຄ້າ ລາຍລະອຽດສິນຄ້າ ແລະ ຄວບຄຸມສະຕັອກຂອງສິນຄ້າລວມຂອງຮ້ານທັງໝົດ
          </p>
        </div>
        <Link href="/products/new">
          <Button icon={<span className="text-lg leading-none">+</span>}>ເພີ່ມສິນຄ້າ</Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <StatCard label="ລາຍການສິນຄ້າ" value={products.length} />
        <StatCard label="ຈຳນວນສິນຄ້າທັງໝົດ" value={formatMoney(totalStockQty)} />
        <StatCard label="ໃກ້ໝົດ" value={lowStockCount} tone="warning" />
        <StatCard label="ໝົດ" value={outOfStockCount} tone="danger" />
      </div>

      <div className="max-w-sm">
        <Input
          placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ, barcode, ໝວດໝູ່..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={products.length === 0 ? "ຍັງບໍ່ມີສິນຄ້າ" : "ບໍ່ພົບສິນຄ້າທີ່ຄົ້ນຫາ"}
          description={products.length === 0 ? "ເລີ່ມຕົ້ນໂດຍການເພີ່ມສິນຄ້າອັນທຳອິດ" : undefined}
          action={
            products.length === 0 ? (
              <Link href="/products/new">
                <Button>ເພີ່ມສິນຄ້າ</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="px-4 py-3 font-medium">ຮູບ</th>
                <th className="px-4 py-3 font-medium">ຊື່ສິນຄ້າ</th>
                <th className="px-4 py-3 font-medium">ໝວດໝູ່</th>
                <th className="px-4 py-3 font-medium">ຫົວໜ່ວຍ</th>
                <th className="px-4 py-3 font-medium">ລາຄາຍ່ອຍ</th>
                <th className="px-4 py-3 font-medium">ລາຄາສົ່ງ</th>
                <th className="px-4 py-3 font-medium">ຈຳນວນ</th>
                <th className="px-4 py-3 font-medium">ສະຖານະ</th>
                <th className="px-4 py-3 font-medium text-right">ຈັດການ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const isOut = p.stockQty <= 0;
                const isLow = !isOut && p.stockQty <= p.minStockAlert;
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                    <td className="px-4 py-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-control bg-surface-muted">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-5 w-5 text-text-muted"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                            />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">{p.name}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {categoryById.get(p.categoryId) ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {unitById.get(p.unitId) ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-text-primary">{formatMoney(p.retailPrice)}</td>
                    <td className="px-4 py-3 text-text-primary">{formatMoney(p.wholesalePrice)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary">{formatMoney(p.stockQty)}</span>
                        {isOut && <Badge tone="danger">ໝົດ</Badge>}
                        {isLow && <Badge tone="warning">ໃກ້ໝົດ</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === "ACTIVE" ? (
                        <Badge tone="success">ເປີດ</Badge>
                      ) : (
                        <Badge tone="neutral">ປິດ</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${p.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-control text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                          title="ແກ້ໄຂ"
                        >
                          <IconEdit />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setToDelete(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-control text-text-secondary transition-colors hover:bg-danger-bg hover:text-danger"
                          title="ລຶບ"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="ລຶບສິນຄ້າ"
        description={toDelete ? `ທ່ານຕ້ອງການລຶບ "${toDelete.name}" ແທ້ບໍ່? ບໍ່ສາມາດກູ້ຄືນໄດ້.` : undefined}
        confirmLabel="ລຶບ"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
