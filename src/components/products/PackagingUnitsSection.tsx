"use client";

import { NumberInput } from "@/components/ui/NumberInput";
import { CreatableSelect } from "@/components/ui/CreatableSelect";

export interface PackagingUnitRow {
  unitId: string;
  factor: string;
  costPrice: string;
  retailPrice: string;
  wholesalePrice: string;
  wholesaleMinQty: string;
}

export function blankPackagingUnitRow(): PackagingUnitRow {
  return { unitId: "", factor: "", costPrice: "", retailPrice: "", wholesalePrice: "", wholesaleMinQty: "5" };
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

interface PackagingUnitsSectionProps {
  rows: PackagingUnitRow[];
  onChange: (rows: PackagingUnitRow[]) => void;
  units: { id: string; name: string }[];
  onCreateUnit: (name: string) => Promise<{ id: string; name: string }>;
}

export function PackagingUnitsSection({ rows, onChange, units, onCreateUnit }: PackagingUnitsSectionProps) {
  function updateRow(index: number, patch: Partial<PackagingUnitRow>) {
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...rows, blankPackagingUnitRow()]);
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, index) => (
        <div key={index} className="relative flex flex-col gap-4 rounded-card border border-border p-4">
          <button
            type="button"
            onClick={() => removeRow(index)}
            className="absolute right-3 top-3 text-text-muted hover:text-danger"
            aria-label="ລຶບຫົວໜ່ວຍນີ້"
          >
            <IconTrash />
          </button>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CreatableSelect
              label="ຫົວໜ່ວຍ"
              value={row.unitId}
              onChange={(unitId) => updateRow(index, { unitId })}
              options={units}
              placeholder="ເລືອກຫົວໜ່ວຍ"
              onCreate={onCreateUnit}
            />
            <NumberInput
              label="ຈຳນວນຫົວໜ່ວຍພື້ນຖານ (ຕໍ່ 1 ຫົວໜ່ວຍນີ້)"
              value={row.factor}
              onChange={(factor) => updateRow(index, { factor })}
              placeholder="ຕົວຢ່າງ: ແກັດ 1 = 4 ຕຸກ ➜ ໃສ່ 4"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NumberInput
              label="ລາຄາຕົ້ນທຶນ"
              value={row.costPrice}
              onChange={(costPrice) => updateRow(index, { costPrice })}
              required
            />
            <NumberInput
              label="ລາຄາຍ່ອຍ"
              value={row.retailPrice}
              onChange={(retailPrice) => updateRow(index, { retailPrice })}
              required
            />
            <NumberInput
              label="ລາຄາສົ່ງ"
              value={row.wholesalePrice}
              onChange={(wholesalePrice) => updateRow(index, { wholesalePrice })}
              required
            />
          </div>

          <NumberInput
            label="ຊື້ຍົກຢ່າງໜ້ອຍ (ຫົວໜ່ວຍນີ້) ຈຶ່ງໄດ້ລາຄາສົ່ງ"
            value={row.wholesaleMinQty}
            onChange={(wholesaleMinQty) => updateRow(index, { wholesaleMinQty })}
            required
            className="sm:max-w-64"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="self-start rounded-control border border-dashed border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
      >
        + ເພີ່ມຫົວໜ່ວຍ
      </button>
    </div>
  );
}
