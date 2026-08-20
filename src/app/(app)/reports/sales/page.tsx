"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { SALES_REPORT_DATA } from "@/lib/sales-report-queries";
import { MonthlyRevenueChart, MonthlyPoint } from "@/components/reports/MonthlyRevenueChart";

const MONTH_LABELS = [
  "ມ.ກ", "ກ.ພ", "ມ.ນ", "ມ.ສ", "ພ.ຈ", "ມິ.ຖ",
  "ກ.ລ", "ສ.ຫ", "ກ.ຍ", "ຕ.ລ", "ພ.ຈ", "ທ.ວ",
];

function formatMoney(n: number) {
  return Math.round(n).toLocaleString("lo-LA");
}

export default function ReportsSalesPage() {
  const { data, loading, error } = useQuery(SALES_REPORT_DATA, {
    fetchPolicy: "cache-and-network",
  });
  const [excludeDebt, setExcludeDebt] = useState(false);

  const sales = useMemo(() => {
    const all = data?.sales ?? [];
    return excludeDebt ? all.filter((s) => s.debt <= 0) : all;
  }, [data, excludeDebt]);

  const monthly = useMemo(() => {
    const byMonth = new Map<string, MonthlyPoint>();

    for (const sale of sales) {
      const seconds = Number(sale.saleDate);
      if (Number.isNaN(seconds)) continue;
      const d = new Date(seconds * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      const revenue = sale.items.reduce((sum, i) => sum + i.subtotal, 0) - sale.discount;
      const cost = sale.items.reduce((sum, i) => sum + i.costPrice * i.quantity, 0);

      const existing = byMonth.get(key);
      if (existing) {
        existing.revenue += revenue;
        existing.cost += cost;
        existing.profit += revenue - cost;
      } else {
        byMonth.set(key, {
          key,
          label: `${MONTH_LABELS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
          revenue,
          cost,
          profit: revenue - cost,
        });
      }
    }

    return [...byMonth.values()].sort((a, b) => a.key.localeCompare(b.key)).slice(-12);
  }, [sales]);

  const totals = useMemo(() => {
    return monthly.reduce(
      (acc, m) => ({
        revenue: acc.revenue + m.revenue,
        cost: acc.cost + m.cost,
        profit: acc.profit + m.profit,
      }),
      { revenue: 0, cost: 0, profit: 0 }
    );
  }, [monthly]);

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
          <h1 className="text-2xl font-semibold text-text-primary">ລາຍງານ - ຍອດຂາຍ</h1>
          <p className="mt-1 text-sm text-text-secondary">
            ຍອດຂາຍ ຕົ້ນທຶນ ແລະ ກຳໄລລວມ ໃນແຕ່ລະເດືອນ
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExcludeDebt((v) => !v)}
          className={`h-11 shrink-0 rounded-control border px-4 text-sm font-medium transition-colors ${
            excludeDebt
              ? "border-danger bg-danger-bg text-danger"
              : "border-border bg-surface text-text-secondary hover:bg-surface-muted"
          }`}
        >
          {excludeDebt ? "✓ ລົບບິນຄ້າງໜີ້ອອກ" : "ລົບບິນຄ້າງໜີ້ອອກ"}
        </button>
      </div>

      <div className="flex gap-4">
        <StatCard label="ຍອດຂາຍລວມ" value={`${formatMoney(totals.revenue)} ກີບ`} />
        <StatCard label="ຕົ້ນທຶນລວມ" value={`${formatMoney(totals.cost)} ກີບ`} tone="warning" />
        <StatCard label="ກຳໄລລວມ" value={`${formatMoney(totals.profit)} ກີບ`} />
      </div>

      <div className="rounded-card border border-border bg-surface p-6">
        <h2 className="mb-4 text-sm font-semibold text-text-primary">ສະຖິຕິຍອດຂາຍລາຍເດືອນ</h2>
        <MonthlyRevenueChart data={monthly} />
      </div>

      {monthly.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="px-4 py-3 font-medium">ເດືອນ</th>
                <th className="px-4 py-3 text-right font-medium">ຍອດຂາຍ</th>
                <th className="px-4 py-3 text-right font-medium">ຕົ້ນທຶນ</th>
                <th className="px-4 py-3 text-right font-medium">ກຳໄລ</th>
              </tr>
            </thead>
            <tbody>
              {[...monthly].reverse().map((m) => (
                <tr key={m.key} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text-primary">{m.label}</td>
                  <td className="px-4 py-3 text-right text-text-primary">{formatMoney(m.revenue)} ກີບ</td>
                  <td className="px-4 py-3 text-right text-text-primary">{formatMoney(m.cost)} ກີບ</td>
                  <td className="px-4 py-3 text-right font-medium text-success">
                    {formatMoney(m.profit)} ກີບ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
