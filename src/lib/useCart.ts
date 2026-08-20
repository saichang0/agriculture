"use client";

import { useMemo, useState } from "react";
import { Product } from "./products-queries";

export interface CartLine {
  product: Product;
  unitId: string | null;
  quantity: number;
}

// Resolves prices/wholesaleMinQty for a cart line's chosen unit: null (or no match in
// packagingUnits) means the product's base unit, using its own price fields exactly as
// before this feature existed. Otherwise the matching packaging unit's own prices are
// used verbatim — never derived from the base unit's price. Mirrors resolveSaleUnit on
// the backend (agriculture-api/graph/helpers.go) so the cart preview matches what the
// server will actually charge.
export function computeLinePrice(product: Product, unitId: string | null, quantity: number) {
  const packagingUnit = unitId ? product.packagingUnits.find((u) => u.unitId === unitId) : undefined;

  const retailPrice = packagingUnit ? packagingUnit.retailPrice : product.retailPrice;
  const wholesalePrice = packagingUnit ? packagingUnit.wholesalePrice : product.wholesalePrice;
  const wholesaleMinQty = packagingUnit ? packagingUnit.wholesaleMinQty : product.wholesaleMinQty;

  const useWholesale = quantity >= wholesaleMinQty;
  const unitPrice = useWholesale ? wholesalePrice : retailPrice;
  return {
    unitPrice,
    priceType: useWholesale ? "WHOLESALE" : "RETAIL",
    subtotal: unitPrice * quantity,
  };
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  function addProduct(product: Product, unitId: string | null = null) {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id && l.unitId === unitId);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id && l.unitId === unitId ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...prev, { product, unitId, quantity: 1 }];
    });
  }

  function setQuantity(productId: string, unitId: string | null, quantity: number) {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => !(l.product.id === productId && l.unitId === unitId));
      return prev.map((l) =>
        l.product.id === productId && l.unitId === unitId ? { ...l, quantity } : l
      );
    });
  }

  function removeLine(productId: string, unitId: string | null) {
    setLines((prev) => prev.filter((l) => !(l.product.id === productId && l.unitId === unitId)));
  }

  function clear() {
    setLines([]);
  }

  function loadLines(newLines: CartLine[]) {
    setLines(newLines);
  }

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + computeLinePrice(l.product, l.unitId, l.quantity).subtotal, 0),
    [lines]
  );

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  // Sums a product's quantity across all of its cart lines (a product can appear as
  // multiple lines when added in different packaging units), so the product list can
  // show "already in cart" feedback without callers re-deriving this themselves.
  const quantityByProductId = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of lines) {
      map.set(l.product.id, (map.get(l.product.id) ?? 0) + l.quantity);
    }
    return map;
  }, [lines]);

  return {
    lines,
    addProduct,
    setQuantity,
    removeLine,
    clear,
    loadLines,
    total,
    itemCount,
    quantityByProductId,
  };
}
