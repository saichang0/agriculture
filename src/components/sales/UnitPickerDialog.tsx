"use client";

import { Product } from "@/lib/products-queries";

function formatMoney(n: number) {
  return n.toLocaleString("lo-LA");
}

interface UnitPickerDialogProps {
  product: Product | null;
  unitById: Map<string, string>;
  onClose: () => void;
  onSelect: (unitId: string | null) => void;
}

export function UnitPickerDialog({ product, unitById, onClose, onSelect }: UnitPickerDialogProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-card border border-border bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">ເລືອກຫົວໜ່ວຍ</h2>
            <p className="text-sm text-text-secondary">{product.name}</p>
          </div>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary">
            ✕
          </button>
        </div>

        <div className="flex flex-col p-2">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="flex items-center justify-between rounded-control px-3 py-3 text-left transition-colors hover:bg-surface-muted"
          >
            <span className="text-sm font-medium text-text-primary">
              {unitById.get(product.unitId) ?? "ຫົວໜ່ວຍພື້ນຖານ"}
            </span>
            <span className="text-sm text-text-secondary">{formatMoney(product.retailPrice)} ກີບ</span>
          </button>

          {product.packagingUnits.map((pu) => (
            <button
              key={pu.unitId}
              type="button"
              onClick={() => onSelect(pu.unitId)}
              className="flex items-center justify-between rounded-control px-3 py-3 text-left transition-colors hover:bg-surface-muted"
            >
              <span className="text-sm font-medium text-text-primary">
                {unitById.get(pu.unitId) ?? "ຫົວໜ່ວຍ"}
              </span>
              <span className="text-sm text-text-secondary">{formatMoney(pu.retailPrice)} ກີບ</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
