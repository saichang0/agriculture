"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { PRODUCTS_PAGE_DATA } from "@/lib/products-queries";
import { SALES_PAGE_DATA, CREATE_SALE, CREATE_CUSTOMER } from "@/lib/sales-queries";
import { SALE_BY_ID, UPDATE_SALE } from "@/lib/sales-history-queries";
import { useCart, computeLinePrice, CartLine } from "@/lib/useCart";
import { useBarcodeScanner } from "@/lib/useBarcodeScanner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { CheckoutDialog } from "@/components/sales/CheckoutDialog";
import { CameraScannerDialog } from "@/components/sales/CameraScannerDialog";
import { RemoteScanButton } from "@/components/ui/RemoteScanButton";

function formatMoney(n: number) {
  return n.toLocaleString("lo-LA");
}

function IconList() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23H3.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h17a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-1.686a2.25 2.25 0 0 1-1.64-1.055l-.822-1.316a2.25 2.25 0 0 0-1.909-1.054H9.583a2.25 2.25 0 0 0-1.91 1.054l-.822 1.316Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
    </svg>
  );
}

function ProductNoImage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6 text-text-muted">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  );
}

interface CartContentProps {
  lines: CartLine[];
  total: number;
  editSaleId: string | null;
  savingEdit: boolean;
  updateError: { message: string } | null | undefined;
  onSetQuantity: (productId: string, quantity: number) => void;
  onRemoveLine: (productId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onCheckout: () => void;
}

function CartContent({
  lines,
  total,
  editSaleId,
  savingEdit,
  updateError,
  onSetQuantity,
  onRemoveLine,
  onCancelEdit,
  onSaveEdit,
  onCheckout,
}: CartContentProps) {
  return (
    <>
      {editSaleId && (
        <div className="mx-5 mt-3 shrink-0 rounded-control bg-info-bg px-3.5 py-2.5 text-sm text-info">
          ກຳລັງແກ້ໄຂໃບບິນ — ເພີ່ມ ຫຼື ເອົາສິນຄ້າອອກ ແລ້ວກົດ &ldquo;ບັນທຶກການແກ້ໄຂ&rdquo;
        </div>
      )}

      {lines.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <EmptyState title="ຍັງບໍ່ມີສິນຄ້າ" description="ກົດເລືອກສິນຄ້າ ຫຼື ສະແກນ barcode" />
        </div>
      ) : (
        <div className="mt-3 px-5">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-border text-xs text-text-secondary">
                <th className="pb-2 font-medium">ສິນຄ້າ</th>
                <th className="w-28 pb-2 text-center font-medium">ຈຳນວນ</th>
                <th className="w-24 pb-2 text-right font-medium">ລາຄາ</th>
                <th className="w-6 pb-2" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => {
                const { unitPrice, priceType, subtotal } = computeLinePrice(line.product, line.quantity);
                return (
                  <tr key={line.product.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-2 align-top">
                      <div className="text-sm font-medium text-text-primary">{line.product.name}</div>
                      <div className="text-xs text-text-secondary">
                        {formatMoney(unitPrice)} ກີບ/{priceType === "WHOLESALE" ? "ສົ່ງ" : "ຍ່ອຍ"}
                      </div>
                    </td>
                    <td className="py-2.5 align-top">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSetQuantity(line.product.id, line.quantity - 1)}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-control border border-border text-text-secondary hover:bg-surface-muted"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm text-text-primary">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onSetQuantity(line.product.id, line.quantity + 1)}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-control border border-border text-text-secondary hover:bg-surface-muted"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 text-right align-top text-sm font-medium text-text-primary">
                      {formatMoney(subtotal)}
                    </td>
                    <td className="py-2.5 align-top">
                      <button
                        type="button"
                        onClick={() => onRemoveLine(line.product.id)}
                        className="text-text-muted hover:text-danger"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="shrink-0 border-t border-border p-5">
        <div className="flex items-center justify-between text-base font-semibold text-text-primary">
          <span>ລວມ</span>
          <span>{formatMoney(total)} ກີບ</span>
        </div>
        {updateError && (
          <div className="mt-3 rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {updateError.message}
          </div>
        )}
        {editSaleId ? (
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" fullWidth size="lg" onClick={onCancelEdit} disabled={savingEdit}>
              ຍົກເລີກ
            </Button>
            <Button fullWidth size="lg" disabled={lines.length === 0 || savingEdit} onClick={onSaveEdit}>
              {savingEdit ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກການແກ້ໄຂ"}
            </Button>
          </div>
        ) : (
          <Button fullWidth size="lg" className="mt-4" disabled={lines.length === 0} onClick={onCheckout}>
            ຊຳລະ
          </Button>
        )}
      </div>
    </>
  );
}

export default function SalesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSaleId = searchParams.get("editSale");

  const { data: productsData, loading: loadingProducts } = useQuery(PRODUCTS_PAGE_DATA);
  const { data: salesData, loading: loadingSales, refetch: refetchCustomers } = useQuery(
    SALES_PAGE_DATA
  );
  const { data: editSaleData, loading: loadingEditSale } = useQuery(SALE_BY_ID, {
    variables: { id: editSaleId ?? "" },
    skip: !editSaleId,
  });
  const [createSale, { loading: checkingOut, error: saleError }] = useMutation(CREATE_SALE, {
    refetchQueries: [{ query: PRODUCTS_PAGE_DATA }],
  });
  const [updateSale, { loading: savingEdit, error: updateError }] = useMutation(UPDATE_SALE, {
    refetchQueries: [{ query: PRODUCTS_PAGE_DATA }],
  });
  const [createCustomer] = useMutation(CREATE_CUSTOMER);

  const [view, setView] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cameraScannerOpen, setCameraScannerOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const [hydratedEditId, setHydratedEditId] = useState<string | null>(null);

  const cart = useCart();

  // When arriving via "?editSale=<id>" from a sale's detail page, load that sale's
  // items into the cart once its data + the product catalog are both ready, so the
  // cashier can add/remove items using the normal cart UI before saving the correction.
  useEffect(() => {
    if (!editSaleId || hydratedEditId === editSaleId) return;
    if (!editSaleData?.sale || !productsData?.products) return;

    const productById = new Map(productsData.products.map((p) => [p.id, p]));
    const lines = editSaleData.sale.items
      .map((item) => {
        const product = productById.get(item.productId);
        if (!product) return null;
        return { product, quantity: item.quantity };
      })
      .filter((l): l is { product: (typeof productsData.products)[number]; quantity: number } => l !== null);

    cart.loadLines(lines);
    setHydratedEditId(editSaleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editSaleId, editSaleData, productsData, hydratedEditId]);

  const products = useMemo(
    () => (productsData?.products ?? []).filter((p) => p.status === "ACTIVE"),
    [productsData]
  );
  const categories = productsData?.categories ?? [];

  const categoryById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const handleScan = useCallback(
    (code: string) => {
      const match = products.find((p) => p.barcode === code);
      if (match) {
        cart.addProduct(match);
        setScanNotice(`ເພີ່ມ "${match.name}" ເຂົ້າກະຕ່າແລ້ວ`);
      } else {
        setScanNotice(`ບໍ່ພົບສິນຄ້າສຳລັບລະຫັດ ${code}`);
      }
      setTimeout(() => setScanNotice(null), 2500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products]
  );

  useBarcodeScanner(handleScan);

  const handleCameraScan = useCallback(
    (code: string) => {
      setCameraScannerOpen(false);
      handleScan(code);
    },
    [handleScan]
  );

  const filtered = products.filter((p) => {
    if (categoryId && p.categoryId !== categoryId) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.barcode ?? "").toLowerCase().includes(q);
  });

  async function handleConfirmCheckout(opts: {
    customerId: string | null;
    paid: number;
    paymentMethod: string | null;
    dueDate: string | null;
  }) {
    const { data } = await createSale({
      variables: {
        input: {
          customerId: opts.customerId,
          items: cart.lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
          paid: opts.paid,
          paymentMethod: opts.paymentMethod,
          dueDate: opts.dueDate,
        },
      },
    });
    if (data?.createSale) {
      setSuccessToast(`ຂາຍສຳເລັດ! ໃບບິນ ${data.createSale.code}`);
      setTimeout(() => setSuccessToast(null), 3000);
      cart.clear();
      setCheckoutOpen(false);
    }
  }

  async function handleSaveEdit() {
    if (!editSaleId) return;
    const { data } = await updateSale({
      variables: {
        id: editSaleId,
        input: {
          items: cart.lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        },
      },
    });
    if (data?.updateSale) {
      cart.clear();
      router.push(`/reports/history/${editSaleId}`);
    }
  }

  function handleCancelEdit() {
    cart.clear();
    router.push(`/reports/history/${editSaleId}`);
  }

  if (loadingProducts || loadingSales || (editSaleId && loadingEditSale && hydratedEditId !== editSaleId)) {
    return <LoadingState />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
      {/* Left: products */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pb-24 sm:p-6 lg:pb-6">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 lg:max-w-sm">
            <Input
              placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => setCameraScannerOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-muted"
            title="ສະແກນດ້ວຍກ້ອງ"
          >
            <IconCamera />
          </button>

          <RemoteScanButton onScan={handleScan} />

          <button
            type="button"
            onClick={() => setView(view === "grid" ? "list" : "grid")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-muted"
            title={view === "grid" ? "ສະແດງເປັນລາຍການ" : "ສະແດງເປັນກາດ"}
          >
            {view === "grid" ? <IconList /> : <IconGrid />}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryId("")}
            className={`rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors ${categoryId === "" ? "bg-primary text-primary-text" : "bg-surface-muted text-text-secondary hover:bg-border"
              }`}
          >
            ທັງໝົດ
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id)}
              className={`rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors ${categoryId === c.id ? "bg-primary text-primary-text" : "bg-surface-muted text-text-secondary hover:bg-border"
                }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {scanNotice && (
          <div className="rounded-control bg-info-bg px-3.5 py-2.5 text-sm text-info">{scanNotice}</div>
        )}

        {filtered.length === 0 ? (
          <EmptyState title="ບໍ່ພົບສິນຄ້າ" />
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => cart.addProduct(p)}
                disabled={p.stockQty <= 0}
                className="flex flex-col overflow-hidden rounded-card border border-border bg-surface text-left transition-shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex aspect-square items-center justify-center bg-surface-muted">
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.name} width={160} height={160} className="h-full w-full object-cover" />
                  ) : (
                    <ProductNoImage />
                  )}
                </div>
                <div className="flex flex-col gap-1 p-3">
                  <span className="truncate text-sm font-medium text-text-primary">{p.name}</span>
                  <span className="text-sm text-text-secondary">{formatMoney(p.retailPrice)} ກີບ</span>
                  {p.stockQty <= 0 ? (
                    <Badge tone="danger">ໝົດ</Badge>
                  ) : p.stockQty <= p.minStockAlert ? (
                    <Badge tone="warning">ໃກ້ໝົດ</Badge>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col overflow-hidden rounded-card border border-border bg-surface">
            <div className="hidden items-center gap-4 border-b border-border bg-surface-muted px-4 py-2.5 text-xs font-medium text-text-secondary sm:flex">
              <div className="w-11 shrink-0" />
              <div className="min-w-0 flex-1">ສິນຄ້າ</div>
              <div className="hidden w-32 shrink-0 text-right md:block">ປະເພດ</div>
              <div className="w-32 shrink-0 text-right">ລາຄາຍ່ອຍ</div>
              <div className="hidden w-32 shrink-0 text-right md:block">ລາຄາສົ່ງ</div>
              <div className="w-28 shrink-0 text-right">ຈຳນວນ</div>
              <div className="hidden w-24 shrink-0 text-right sm:block">ສະຖານະ</div>
            </div>

            {filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => cart.addProduct(p)}
                disabled={p.stockQty <= 0}
                className="flex w-full items-center gap-3 border-b border-border px-3 py-3 text-left transition-colors last:border-0 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50 sm:gap-4 sm:px-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-control bg-surface-muted">
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.name} width={44} height={44} className="h-full w-full object-cover" />
                  ) : (
                    <ProductNoImage />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-text-primary">{p.name}</span>
                  <span className="text-xs text-text-secondary sm:hidden">
                    {categoryById.get(p.categoryId) ?? "-"}
                  </span>
                </div>
                <div className="hidden w-32 shrink-0 text-right md:block">
                  <span className="truncate text-xs text-text-secondary">
                    {categoryById.get(p.categoryId) ?? "-"}
                  </span>
                </div>
                <div className="w-24 shrink-0 text-right text-sm font-semibold text-text-primary sm:w-32">
                  {formatMoney(p.retailPrice)} ກີບ
                </div>

                <div className="hidden w-32 shrink-0 text-right text-xs text-text-secondary md:block">
                  {formatMoney(p.wholesalePrice)} ກີບ
                  <br />
                  (≥{p.wholesaleMinQty} ຫົວໜ່ວຍ)
                </div>

                <div className="w-16 shrink-0 text-right text-sm text-text-primary sm:w-28">
                  {formatMoney(p.stockQty)}
                </div>

                <div className="hidden w-24 shrink-0 justify-end sm:flex">
                  {p.stockQty <= 0 ? (
                    <Badge tone="danger">ໝົດ</Badge>
                  ) : p.stockQty <= p.minStockAlert ? (
                    <Badge tone="warning">ໃກ້ໝົດ</Badge>
                  ) : (
                    <Badge tone="success">ພ້ອມຂາຍ</Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: cart — desktop/tablet only, always visible. The whole panel
          scrolls as one unit so the checkout button is always reachable. */}
      <div className="hidden h-full w-full max-w-md shrink-0 flex-col overflow-y-auto border-l border-border bg-surface lg:flex">
        <h2 className="shrink-0 px-5 pt-5 text-lg font-semibold text-text-primary">ກະຕ່າ</h2>
        <CartContent
          lines={cart.lines}
          total={cart.total}
          editSaleId={editSaleId}
          savingEdit={savingEdit}
          updateError={updateError}
          onSetQuantity={cart.setQuantity}
          onRemoveLine={cart.removeLine}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
          onCheckout={() => setCheckoutOpen(true)}
        />
      </div>

      {/* Mobile: sticky bottom bar opens the cart as a full-screen overlay */}
      <button
        type="button"
        onClick={() => setMobileCartOpen(true)}
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-border bg-sidebar-bg px-5 py-4 text-white shadow-lg lg:hidden"
      >
        <span className="text-sm font-medium">
          ກະຕ່າ ({cart.itemCount}) — {formatMoney(cart.total)} ກີບ
        </span>
        <span className="text-sm font-semibold underline">ເປີດ</span>
      </button>

      {mobileCartOpen && (
        <div className="fixed inset-0 z-1000 flex flex-col bg-surface lg:hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold text-text-primary">ກະຕ່າ</h2>
            <button
              type="button"
              onClick={() => setMobileCartOpen(false)}
              className="text-text-muted hover:text-text-primary"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <CartContent
              lines={cart.lines}
              total={cart.total}
              editSaleId={editSaleId}
              savingEdit={savingEdit}
              updateError={updateError}
              onSetQuantity={cart.setQuantity}
              onRemoveLine={cart.removeLine}
              onCancelEdit={() => {
                setMobileCartOpen(false);
                handleCancelEdit();
              }}
              onSaveEdit={handleSaveEdit}
              onCheckout={() => {
                setMobileCartOpen(false);
                setCheckoutOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {successToast && <Toast message={successToast} tone="success" />}

      <CheckoutDialog
        open={checkoutOpen}
        total={cart.total}
        customers={salesData?.customers ?? []}
        loading={checkingOut}
        error={saleError?.message ?? null}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={handleConfirmCheckout}
        onCreateCustomer={async (name, phone) => {
          const { data } = await createCustomer({ variables: { input: { name, phone } } });
          if (!data?.createCustomer) throw new Error("ບໍ່ສາມາດເພີ່ມລູກຄ້າໄດ້");
          await refetchCustomers();
          return data.createCustomer;
        }}
      />

      <CameraScannerDialog
        open={cameraScannerOpen}
        onClose={() => setCameraScannerOpen(false)}
        onScan={handleCameraScan}
      />
    </div>
  );
}
