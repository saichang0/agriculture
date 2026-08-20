"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { DateRangeFilter, DateRange } from "@/components/ui/DateRangeFilter";
import { SALES_HISTORY_DATA } from "@/lib/sales-history-queries";

function formatMoney(n: number) {
  return n.toLocaleString("lo-LA");
}

// saleDate is a Unix-seconds string from the backend, not an ISO string.
function formatDateTime(unixSecondsStr: string) {
  const seconds = Number(unixSecondsStr);
  if (Number.isNaN(seconds)) return unixSecondsStr;
  const d = new Date(seconds * 1000);
  const datePart = `${d.getMonth() + 1},${d.getDate()}, ${d.getFullYear()}`;
  const timePart = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${datePart} ${timePart}`;
}

function saleDateStr(unixSecondsStr: string) {
  const seconds = Number(unixSecondsStr);
  if (Number.isNaN(seconds)) return "";
  const d = new Date(seconds * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ReportsHistoryPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery(SALES_HISTORY_DATA, {
    fetchPolicy: "cache-and-network",
  });

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });

  const customerById = useMemo(() => {
    const map = new Map<string, string>();
    data?.customers.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [data]);

  // "ປະຫວັດການຂາຍ" only shows fully-settled orders — no debt, no partial payment.
  // Those belong on the ລູກຄ້າ & ໜີ້ຄ້າງ page instead.
  const completedSales = useMemo(() => {
    const list = (data?.sales ?? []).filter((s) => s.paymentStatus === "PAID");
    list.sort((a, b) => Number(b.saleDate) - Number(a.saleDate));
    return list;
  }, [data]);

  // Date filter narrows the working set first, so the KPI cards and search
  // below always agree with whatever range is selected.
  const dateFiltered = useMemo(() => {
    if (!dateRange.from && !dateRange.to) return completedSales;
    return completedSales.filter((s) => {
      const d = saleDateStr(s.saleDate);
      if (dateRange.from && d < dateRange.from) return false;
      if (dateRange.to && d > dateRange.to) return false;
      return true;
    });
  }, [completedSales, dateRange]);

  const filtered = dateFiltered.filter((s) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const customerName = s.customerId ? (customerById.get(s.customerId) ?? "") : "";
    return s.code.toLowerCase().includes(q) || customerName.toLowerCase().includes(q);
  });

  const totalRevenue = dateFiltered.reduce((sum, s) => sum + s.total, 0);

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
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">ລາຍງານ - ປະຫວັດການຂາຍ</h1>
        <p className="mt-1 text-sm text-text-secondary">
          ລາຍການທີ່ຂາຍສຳເລັດ ຈ່າຍຄົບແລ້ວທັງໝົດ
        </p>
      </div>

      <div className="flex gap-4">
        <StatCard label="ຈຳນວນບິນ" value={dateFiltered.length} />
        <StatCard label="ຍອດຂາຍລວມ" value={`${formatMoney(totalRevenue)} ກີບ`} />
      </div>

      <div className="flex items-center gap-3">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="ຄົ້ນຫາເລກທີ່ບິນ ຫຼື ຊື່ລູກຄ້າ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={completedSales.length === 0 ? "ຍັງບໍ່ມີບິນທີ່ຂາຍສຳເລັດ" : "ບໍ່ພົບບິນທີ່ຄົ້ນຫາ"}
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="px-4 py-3 font-medium">ເລກທີ່ບິນ</th>
                <th className="px-4 py-3 font-medium">ວັນທີ</th>
                <th className="px-4 py-3 font-medium">ລູກຄ້າ</th>
                <th className="w-28 px-4 py-3 font-medium">ຈຳນວນ</th>
                <th className="w-36 px-4 py-3 font-medium">ຍອດລວມ</th>
                <th className="w-28 px-4 py-3 font-medium">ສະຖານະ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-muted"
                  onClick={() => router.push(`/reports/history/${s.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-text-primary">{s.code}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDateTime(s.saleDate)}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {s.customerId ? (customerById.get(s.customerId) ?? "-") : "ລູກຄ້າທົ່ວໄປ"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{s.items.length}</td>
                  <td className="px-4 py-3 font-medium text-text-primary">{formatMoney(s.total)} ກີບ</td>
                  <td className="px-4 py-3">
                    <Badge tone="success">ຈ່າຍຄົບ</Badge>
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
