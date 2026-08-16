"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "./Spinner";

interface CreatableSelectProps {
  label: string;
  value: string;
  onChange: (id: string) => void;
  options: { id: string; name: string }[];
  placeholder: string;
  onCreate: (name: string) => Promise<{ id: string; name: string }>;
}

export function CreatableSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  onCreate,
}: CreatableSelectProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adding) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAdding(false);
        setNewName("");
        setError(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [adding]);

  function closeAdding() {
    setAdding(false);
    setNewName("");
    setError(null);
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    setError(null);
    try {
      const created = await onCreate(name);
      onChange(created.id);
      setNewName("");
      setAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ບໍ່ສາມາດເພີ່ມໄດ້");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value === "__add__") {
            setAdding(true);
            setTimeout(() => inputRef.current?.focus(), 0);
            return;
          }
          onChange(e.target.value);
        }}
        required
        className="h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
        <option value="__add__">+ ເພີ່ມ{label}ໃໝ່...</option>
      </select>

      {adding && (
        <div className="absolute top-full left-0 z-100 mt-1.5 w-64 rounded-card border border-border bg-surface p-3 shadow-lg">
          <div className="flex flex-col gap-2">
            <input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
                if (e.key === "Escape") {
                  closeAdding();
                }
              }}
              placeholder={`ຊື່${label}ໃໝ່...`}
              disabled={saving}
              className="h-10 rounded-control border border-primary bg-surface px-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/10"
            />
            {error && <span className="text-xs text-danger">{error}</span>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeAdding}
                disabled={saving}
                className="rounded-control px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-muted"
              >
                ຍົກເລີກ
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving || !newName.trim()}
                className="flex items-center justify-center rounded-control bg-primary px-3 py-1.5 text-sm text-primary-text disabled:opacity-60"
              >
                {saving ? <Spinner className="h-4 w-4" /> : "ບັນທຶກ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
