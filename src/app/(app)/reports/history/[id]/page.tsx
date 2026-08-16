"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { PRODUCTS_PAGE_DATA, Product } from "@/lib/products-queries";
import { SALE_BY_ID, USER_BY_ID } from "@/lib/sales-history-queries";
import { CUSTOMER_BY_ID } from "@/lib/customers-queries";

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

function statusBadge(status: string) {
  if (status === "PAID") return <Badge tone="success">ຈ່າຍຄົບ</Badge>;
  if (status === "PARTIAL") return <Badge tone="warning">ຈ່າຍບາງສ່ວນ</Badge>;
  return <Badge tone="danger">ຄ້າງໜີ້</Badge>;
}

export default function SaleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const saleId = params.id;

  const { data, loading, error } = useQuery(SALE_BY_ID, {
    variables: { id: saleId },
    fetchPolicy: "cache-and-network",
  });
  const { data: productsData } = useQuery(PRODUCTS_PAGE_DATA);

  const sale = data?.sale ?? null;

  const { data: customerData } = useQuery(CUSTOMER_BY_ID, {
    variables: { id: sale?.customerId ?? "" },
    skip: !sale?.customerId,
  });

  const { data: userData } = useQuery(USER_BY_ID, {
    variables: { id: sale?.userId ?? "" },
    skip: !sale?.userId,
  });

  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    productsData?.products.forEach((p) => map.set(p.id, p));
    return map;
  }, [productsData]);

  if (loading && !data) return <LoadingState />;

  if (error || !sale) {
    return (
      <div className="p-8">
        <EmptyState title="ບໍ່ພົບໃບບິນນີ້" description={error?.message} />
      </div>
    );
  }

  function handleEdit() {
    router.push(`/sales?editSale=${saleId}`);
  }

  const salesperson = userData?.user ? `${userData.user.firstName} ${userData.user.lastName}` : "...";

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/reports/history")}
          className="flex w-fit items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
        >
          ← ກັບໄປປະຫວັດການຂາຍ
        </button>
        <Button onClick={handleEdit}>ແກ້ໄຂ</Button>
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-surface">
        {/* Invoice meta */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-text-secondary">ເລກທີ່ບິນ</span>
            <span className="text-xl font-semibold text-text-primary">{sale.code}</span>
            <span className="text-sm text-text-secondary">{formatDateTime(sale.saleDate)}</span>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {statusBadge(sale.paymentStatus)}
            <span className="text-xs text-text-secondary">ພະນັກງານຂາຍ: {salesperson}</span>
          </div>
        </div>

        {/* Customer */}
        <div className="flex flex-wrap gap-8 border-b border-border bg-surface-muted px-6 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-text-secondary">ລູກຄ້າ</span>
            {sale.customerId ? (
              <Link
                href={`/customers/${sale.customerId}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {customerData?.customer?.name ?? "..."}
              </Link>
            ) : (
              <span className="text-sm font-medium text-text-primary">ລູກຄ້າທົ່ວໄປ</span>
            )}
          </div>
          {customerData?.customer?.phone && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-text-secondary">ເບີໂທ</span>
              <span className="text-sm font-medium text-text-primary">{customerData.customer.phone}</span>
            </div>
          )}
          {sale.dueDate && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-text-secondary">ກຳນົດຈ່າຍ</span>
              <span className="text-sm font-medium text-text-primary">{sale.dueDate}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text-secondary">
              <th className="w-12 px-6 py-3 font-medium">ລຳດັບ</th>
              <th className="px-4 py-3 font-medium">ລາຍການ</th>
              <th className="w-24 px-4 py-3 text-right font-medium">ຈຳນວນ</th>
              <th className="w-32 px-4 py-3 text-right font-medium">ລາຄາ</th>
              <th className="w-32 px-6 py-3 text-right font-medium">ລວມ</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, index) => {
              const product = productById.get(item.productId);
              return (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-3 text-text-secondary">{index + 1}</td>
                  <td className="px-4 py-3">
                    {product ? (
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="font-medium text-text-primary hover:text-primary hover:underline"
                      >
                        {product.name}
                      </Link>
                    ) : (
                      <span className="text-text-secondary">ສິນຄ້າຖືກລຶບແລ້ວ</span>
                    )}
                    <div className="text-xs text-text-secondary">
                      {item.priceType === "WHOLESALE" ? "ລາຄາສົ່ງ" : "ລາຄາຍ່ອຍ"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-text-primary">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-text-primary">{formatMoney(item.unitPrice)}</td>
                  <td className="px-6 py-3 text-right font-medium text-text-primary">
                    {formatMoney(item.subtotal)} ກີບ
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex flex-col gap-2 border-t border-border p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">ຍອດລວມ</span>
            <span className="text-text-primary">{formatMoney(sale.total)} ກີບ</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">ຈ່າຍແລ້ວ</span>
            <span className="text-text-primary">{formatMoney(sale.paid)} ກີບ</span>
          </div>
          {sale.debt > 0 && (
            <div className="flex items-center justify-between text-sm font-medium text-danger">
              <span>ຄ້າງໜີ້</span>
              <span>{formatMoney(sale.debt)} ກີບ</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
            <span className="text-base font-semibold text-text-primary">ຍອດເງິນລວມທັງໝົດ</span>
            <span className="text-xl font-semibold text-success">{formatMoney(sale.total)} ກີບ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
