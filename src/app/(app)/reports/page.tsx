"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { DateRangeFilter, DateRange } from "@/components/ui/DateRangeFilter";
import { REPORTS_OVERVIEW_DATA } from "@/lib/reports-overview-queries";

function formatMoney(n: number) {
  return Math.round(n).toLocaleString("lo-LA");
}

function dateStr(unixSecondsStr: string) {
  const seconds = Number(unixSecondsStr);
  if (Number.isNaN(seconds)) return "";
  const d = new Date(seconds * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function inRange(unixSecondsStr: string, range: DateRange) {
  if (!range.from && !range.to) return true;
  const d = dateStr(unixSecondsStr);
  if (range.from && d < range.from) return false;
  if (range.to && d > range.to) return false;
  return true;
}

export default function ReportsOverviewPage() {
  const { data, loading, error } = useQuery(REPORTS_OVERVIEW_DATA, {
    fetchPolicy: "cache-and-network",
  });
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });

  const summary = useMemo(() => {
    const sales = (data?.sales ?? []).filter((s) => inRange(s.saleDate, dateRange));
    const expenses = (data?.expenses ?? []).filter((e) => inRange(e.date, dateRange));
    const damaged = (data?.damagedProducts ?? []).filter((d) => inRange(d.date, dateRange));

    const salesRevenue = sales.reduce(
      (sum, s) => sum + s.items.reduce((itemSum, i) => itemSum + i.subtotal, 0) - s.discount,
      0
    );
    const salesCost = sales.reduce(
      (sum, s) => sum + s.items.reduce((itemSum, i) => itemSum + i.costPrice * i.quantity, 0),
      0
    );
    const salesProfit = salesRevenue - salesCost;

    const otherIncome = expenses.filter((e) => e.type === "INCOME").reduce((s, e) => s + e.amount, 0);
    const otherExpense = expenses.filter((e) => e.type === "EXPENSE").reduce((s, e) => s + e.amount, 0);

    const damagedCost = damaged.reduce((s, d) => s + d.costPrice * d.quantity, 0);

    const netProfit = salesProfit - otherExpense + otherIncome - damagedCost;

    return { salesRevenue, salesCost, salesProfit, otherIncome, otherExpense, damagedCost, netProfit };
  }, [data, dateRange]);

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">ລາຍງານ - ພາບລວມ</h1>
          <p className="mt-1 text-sm text-text-secondary">
            ສະຫຼຸບກຳໄລສຸດທິຂອງຮ້ານ ຈາກຍອດຂາຍ, ລາຍຮັບ-ລາຍຈ່າຍ ແລະ ສິນຄ້າເສຍຫາຍ
          </p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Net profit hero */}
      <div className="rounded-card border border-border bg-surface p-6">
        <p className="text-sm font-medium text-text-secondary">ກຳໄລສຸດທິ</p>
        <p
          className={`mt-1 text-4xl font-semibold ${
            summary.netProfit >= 0 ? "text-success" : "text-danger"
          }`}
        >
          {summary.netProfit >= 0 ? "+" : ""}
          {formatMoney(summary.netProfit)} ກີບ
        </p>
        <p className="mt-2 text-xs text-text-secondary">
          ກຳໄລຈາກການຂາຍ − ລາຍຈ່າຍ + ລາຍຮັບອື່ນ − ມູນຄ່າສິນຄ້າເສຍຫາຍ
        </p>
      </div>

      {/* Sales breakdown */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text-primary">ຈາກການຂາຍ</h2>
        <div className="flex gap-4">
          <StatCard label="ຍອດຂາຍລວມ" value={`${formatMoney(summary.salesRevenue)} ກີບ`} />
          <StatCard label="ຕົ້ນທຶນສິນຄ້າ" value={`${formatMoney(summary.salesCost)} ກີບ`} tone="warning" />
          <StatCard label="ກຳໄລການຂາຍ" value={`${formatMoney(summary.salesProfit)} ກີບ`} />
        </div>
      </div>

      {/* Other income/expense breakdown */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text-primary">ລາຍຮັບ-ລາຍຈ່າຍອື່ນ</h2>
        <div className="flex gap-4">
          <StatCard label="ລາຍຮັບອື່ນ" value={`${formatMoney(summary.otherIncome)} ກີບ`} />
          <StatCard label="ລາຍຈ່າຍ" value={`${formatMoney(summary.otherExpense)} ກີບ`} tone="warning" />
          <StatCard label="ມູນຄ່າສິນຄ້າເສຍຫາຍ" value={`${formatMoney(summary.damagedCost)} ກີບ`} tone="danger" />
        </div>
      </div>
    </div>
  );
}
