"use client";

import { useEffect, useRef, useState } from "react";

export interface DateRange {
  from: string | null; // "YYYY-MM-DD"
  to: string | null; // "YYYY-MM-DD"
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  return copy;
}

function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

const PRESETS: { key: string; label: string; range: () => DateRange }[] = [
  {
    key: "today",
    label: "ມື້ນີ້",
    range: () => {
      const today = toDateStr(new Date());
      return { from: today, to: today };
    },
  },
  {
    key: "yesterday",
    label: "ມື້ວານນີ້",
    range: () => {
      const y = toDateStr(addDays(new Date(), -1));
      return { from: y, to: y };
    },
  },
  {
    key: "thisWeek",
    label: "ອາທິດນີ້",
    range: () => {
      const start = startOfWeek(new Date());
      return { from: toDateStr(start), to: toDateStr(addDays(start, 6)) };
    },
  },
  {
    key: "lastWeek",
    label: "ອາທິດກ່ອນ",
    range: () => {
      const start = addDays(startOfWeek(new Date()), -7);
      return { from: toDateStr(start), to: toDateStr(addDays(start, 6)) };
    },
  },
  {
    key: "thisMonth",
    label: "ເດືອນນີ້",
    range: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: toDateStr(start), to: toDateStr(end) };
    },
  },
  {
    key: "lastMonth",
    label: "ເດືອນກ່ອນ",
    range: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: toDateStr(start), to: toDateStr(end) };
    },
  },
  {
    key: "thisYear",
    label: "ປີນີ້",
    range: () => {
      const now = new Date();
      return { from: toDateStr(new Date(now.getFullYear(), 0, 1)), to: toDateStr(new Date(now.getFullYear(), 11, 31)) };
    },
  },
  {
    key: "lastYear",
    label: "ປີທີ່ແລ້ວ",
    range: () => {
      const now = new Date();
      return {
        from: toDateStr(new Date(now.getFullYear() - 1, 0, 1)),
        to: toDateStr(new Date(now.getFullYear() - 1, 11, 31)),
      };
    },
  },
];

function formatDisplay(range: DateRange) {
  if (!range.from && !range.to) return "ທຸກວັນທີ";
  const from = range.from ? range.from.split("-").reverse().join("/") : "...";
  const to = range.to ? range.to.split("-").reverse().join("/") : "...";
  return `${from} - ${to}`;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>(value);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setActivePreset(null);
    }
  }, [open, value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setDraft(preset.range());
    setActivePreset(preset.key);
  }

  function handleConfirm() {
    onChange(draft);
    setOpen(false);
  }

  function handleClear() {
    onChange({ from: null, to: null });
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 items-center gap-2 rounded-control border border-border bg-surface px-4 text-sm font-medium text-text-primary hover:bg-surface-muted"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4 text-text-secondary">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
        {formatDisplay(value)}
      </button>

      {open && (
        <div className="absolute right-0 z-100 mt-2 w-80 rounded-card border border-border bg-surface p-4 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`rounded-control border px-3 py-2.5 text-sm font-medium transition-colors ${
                  activePreset === preset.key
                    ? "border-primary bg-primary text-primary-text"
                    : "border-border bg-surface text-text-primary hover:bg-surface-muted"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            <input
              type="date"
              value={draft.from ?? ""}
              onChange={(e) => {
                setDraft((d) => ({ ...d, from: e.target.value || null }));
                setActivePreset(null);
              }}
              className="h-10 min-w-0 flex-1 rounded-control border border-border bg-surface px-2.5 text-sm text-text-primary outline-none focus:border-primary"
            />
            <span className="shrink-0 text-text-secondary">-</span>
            <input
              type="date"
              value={draft.to ?? ""}
              onChange={(e) => {
                setDraft((d) => ({ ...d, to: e.target.value || null }));
                setActivePreset(null);
              }}
              className="h-10 min-w-0 flex-1 rounded-control border border-border bg-surface px-2.5 text-sm text-text-primary outline-none focus:border-primary"
            />
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 rounded-control border border-border py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-muted"
            >
              ລ້າງ
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 rounded-control bg-primary py-2.5 text-sm font-medium text-primary-text hover:bg-primary-hover"
            >
              ຢືນຢັນ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
