"use client";

import { useMemo, useState } from "react";

export interface MonthlyPoint {
  key: string; // "2026-08"
  label: string; // "ສ.ຫ 26"
  revenue: number;
  cost: number;
  profit: number;
}

interface MonthlyRevenueChartProps {
  data: MonthlyPoint[];
}

function formatMoney(n: number) {
  return Math.round(n).toLocaleString("lo-LA");
}

function niceMax(value: number) {
  if (value <= 0) return 1000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  let step: number;
  if (normalized <= 1) step = 1;
  else if (normalized <= 2) step = 2;
  else if (normalized <= 5) step = 5;
  else step = 10;
  return step * magnitude;
}

const SERIES = [
  { key: "revenue" as const, label: "ຍອດຂາຍ", color: "var(--color-primary)" },
  { key: "cost" as const, label: "ຕົ້ນທຶນ", color: "var(--color-warning)" },
  { key: "profit" as const, label: "ກຳໄລ", color: "var(--color-success)" },
];

export function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const maxValue = useMemo(() => {
    const peak = Math.max(1, ...data.map((d) => Math.max(d.revenue, d.cost, d.profit)));
    return niceMax(peak);
  }, [data]);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxValue * f));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-secondary">
        ຍັງບໍ່ມີຂໍ້ມູນ
      </div>
    );
  }

  const hoveredPoint = data.find((d) => d.key === hovered) ?? null;

  return (
    <div className="flex flex-col gap-4">
      {/* Legend */}
      <div className="flex items-center gap-5">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-xs"
              style={{ backgroundColor: s.color }}
              aria-hidden
            />
            <span className="text-xs font-medium text-text-secondary">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="flex gap-3">
        {/* Y axis */}
        <div className="flex h-64 flex-col justify-between py-0.5 text-right text-xs text-text-muted">
          {[...ticks].reverse().map((t) => (
            <span key={t}>{formatMoney(t)}</span>
          ))}
        </div>

        {/* Bars */}
        <div className="relative flex h-64 flex-1 items-end gap-4 border-l border-b border-border pl-2">
          {/* Gridlines */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-0.5">
            {ticks.map((t) => (
              <div key={t} className="h-px w-full bg-border" />
            ))}
          </div>

          {data.map((point) => (
            <div
              key={point.key}
              className="group relative flex h-full flex-1 items-end justify-center gap-1"
              onPointerEnter={() => setHovered(point.key)}
              onPointerLeave={() => setHovered((h) => (h === point.key ? null : h))}
              onFocus={() => setHovered(point.key)}
              onBlur={() => setHovered((h) => (h === point.key ? null : h))}
              tabIndex={0}
            >
              {SERIES.map((s) => {
                const value = point[s.key];
                const heightPct = maxValue > 0 ? (Math.max(value, 0) / maxValue) * 100 : 0;
                return (
                  <div
                    key={s.key}
                    className="w-full max-w-6 rounded-t-sm transition-opacity"
                    style={{
                      height: `${heightPct}%`,
                      minHeight: value > 0 ? 2 : 0,
                      backgroundColor: s.color,
                      opacity: hovered && hovered !== point.key ? 0.4 : 1,
                    }}
                  />
                );
              })}

              {/* Tooltip */}
              {hovered === point.key && (
                <div className="pointer-events-none absolute bottom-full z-10 mb-2 w-44 -translate-x-1/2 rounded-control border border-border bg-surface p-3 text-left shadow-lg left-1/2">
                  <p className="mb-2 text-xs font-semibold text-text-primary">{point.label}</p>
                  <div className="flex flex-col gap-1">
                    {SERIES.map((s) => (
                      <div key={s.key} className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex items-center gap-1.5 text-text-secondary">
                          <span
                            className="h-2 w-2 shrink-0 rounded-xs"
                            style={{ backgroundColor: s.color }}
                          />
                          {s.label}
                        </span>
                        <span className="font-medium text-text-primary">
                          {formatMoney(point[s.key])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* X axis labels */}
      <div className="flex gap-4 pl-11">
        {data.map((point) => (
          <span
            key={point.key}
            className={`flex-1 text-center text-xs ${
              hoveredPoint?.key === point.key ? "font-medium text-text-primary" : "text-text-secondary"
            }`}
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
