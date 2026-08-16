"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Product } from "@/lib/products-queries";

interface DamagedProductFormDialogProps {
  open: boolean;
  products: Product[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (values: { productId: string; quantity: number; reason: string; note: string | null }) => void;
}

const REASON_PRESETS = ["ເສຍ/ແຕກ", "ໝົດອາຍຸ", "ເສຍລົດ", "ອື່ນໆ"];

export function DamagedProductFormDialog({
  open,
  products,
  loading,
  error,
  onClose,
  onSave,
}: DamagedProductFormDialogProps) {
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityStr, setQuantityStr] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setProductSearch("");
      setSelectedProduct(null);
      setQuantityStr("");
      setReason("");
      setNote("");
    }
  }, [open]);

  if (!open) return null;

  const quantity = Number(quantityStr) || 0;
  const overStock = selectedProduct ? quantity > selectedProduct.stockQty : false;

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    return p.name.toLowerCase().includes(productSearch.trim().toLowerCase());
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct || quantity <= 0 || !reason.trim() || overStock) return;
    onSave({
      productId: selectedProduct.id,
      quantity,
      reason: reason.trim(),
      note: note.trim() || null,
    });
  }

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col overflow-hidden rounded-card border border-border bg-surface shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">ເພີ່ມສິນຄ້າເສຍຫາຍ</h2>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary">
            ✕
          </button>
        </div>

        <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto p-5">
          {/* Product picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">ສິນຄ້າ</label>
            {selectedProduct ? (
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="flex items-center justify-between rounded-control border border-border bg-surface-muted px-3.5 py-2.5 text-left text-sm hover:bg-surface-muted/80"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-text-primary">{selectedProduct.name}</span>
                  <span className="text-xs text-text-secondary">
                    ຄົງເຫຼືອ {selectedProduct.stockQty} ຫົວໜ່ວຍ
                  </span>
                </div>
                <span className="text-xs text-text-secondary">ປ່ຽນ</span>
              </button>
            ) : (
              <>
                <Input
                  autoFocus
                  placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                <div className="flex max-h-48 flex-col overflow-y-auto rounded-control border border-border">
                  {filteredProducts.length === 0 ? (
                    <p className="p-3 text-center text-sm text-text-secondary">ບໍ່ພົບສິນຄ້າ</p>
                  ) : (
                    filteredProducts.slice(0, 30).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedProduct(p)}
                        className="flex items-center justify-between border-b border-border px-3.5 py-2.5 text-left text-sm last:border-0 hover:bg-surface-muted"
                      >
                        <span className="font-medium text-text-primary">{p.name}</span>
                        <span className="text-xs text-text-secondary">ຄົງເຫຼືອ {p.stockQty}</span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <NumberInput
            label="ຈຳນວນ"
            value={quantityStr}
            onChange={setQuantityStr}
            placeholder="0"
            error={overStock ? `ຄົງເຫຼືອພຽງ ${selectedProduct?.stockQty} ຫົວໜ່ວຍ` : undefined}
          />

          {/* Reason presets */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">ສາເຫດ</label>
            <div className="flex flex-wrap gap-2">
              {REASON_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className={`rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors ${
                    reason === preset
                      ? "border-primary bg-primary text-primary-text"
                      : "border-border bg-surface text-text-secondary hover:bg-surface-muted"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ຫຼື ພິມສາເຫດເອງ"
            />
          </div>

          <Input
            label="ໝາຍເຫດ (ບໍ່ບັງຄັບ)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {error && <span className="text-xs text-danger">{error}</span>}
        </div>

        <div className="flex gap-3 border-t border-border p-5 pt-4">
          <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            ຍົກເລີກ
          </Button>
          <Button
            type="submit"
            fullWidth
            disabled={loading || !selectedProduct || quantity <= 0 || !reason.trim() || overStock}
          >
            {loading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
          </Button>
        </div>
      </form>
    </div>
  );
}
