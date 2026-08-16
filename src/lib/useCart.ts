"use client";

import { useMemo, useState } from "react";
import { Product } from "./products-queries";

export interface CartLine {
  product: Product;
  quantity: number;
}

export function computeLinePrice(product: Product, quantity: number) {
  const useWholesale = quantity >= product.wholesaleMinQty;
  const unitPrice = useWholesale ? product.wholesalePrice : product.retailPrice;
  return {
    unitPrice,
    priceType: useWholesale ? "WHOLESALE" : "RETAIL",
    subtotal: unitPrice * quantity,
  };
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  function addProduct(product: Product) {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function setQuantity(productId: string, quantity: number) {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => l.product.id !== productId);
      return prev.map((l) =>
        l.product.id === productId ? { ...l, quantity } : l
      );
    });
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }

  function clear() {
    setLines([]);
  }

  function loadLines(newLines: CartLine[]) {
    setLines(newLines);
  }

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + computeLinePrice(l.product, l.quantity).subtotal, 0),
    [lines]
  );

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  return { lines, addProduct, setQuantity, removeLine, clear, loadLines, total, itemCount };
}
