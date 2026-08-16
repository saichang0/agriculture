"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  PRODUCTS_PAGE_DATA,
  PRODUCT_BY_ID,
  UPDATE_PRODUCT,
  CREATE_CATEGORY,
  CREATE_UNIT,
} from "@/lib/products-queries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Card } from "@/components/ui/Card";
import { CreatableSelect } from "@/components/ui/CreatableSelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-text-primary">{children}</h2>;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const { data: refData, loading: loadingRefs, refetch: refetchRefs } = useQuery(
    PRODUCTS_PAGE_DATA
  );
  const { data: productData, loading: loadingProduct } = useQuery(PRODUCT_BY_ID, {
    variables: { id: productId },
  });
  const [updateProduct, { loading: saving, error }] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: [{ query: PRODUCTS_PAGE_DATA }],
    awaitRefetchQueries: true,
  });
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [createUnit] = useMutation(CREATE_UNIT);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [wholesaleMinQty, setWholesaleMinQty] = useState("5");
  const [stockQty, setStockQty] = useState("0");
  const [minStockAlert, setMinStockAlert] = useState("5");
  const [status, setStatus] = useState("ACTIVE");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || !productData?.product) return;
    const p = productData.product;
    setImageUrl(p.imageUrl);
    setName(p.name);
    setBarcode(p.barcode ?? "");
    setCategoryId(p.categoryId);
    setUnitId(p.unitId);
    setCostPrice(String(p.costPrice));
    setRetailPrice(String(p.retailPrice));
    setWholesalePrice(String(p.wholesalePrice));
    setWholesaleMinQty(String(p.wholesaleMinQty));
    setStockQty(String(p.stockQty));
    setMinStockAlert(String(p.minStockAlert));
    setStatus(p.status);
    setInitialized(true);
  }, [productData, initialized]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { data: result } = await updateProduct({
      variables: {
        id: productId,
        input: {
          name,
          barcode: barcode || null,
          imageUrl,
          categoryId,
          unitId,
          costPrice: Number(costPrice),
          retailPrice: Number(retailPrice),
          wholesalePrice: Number(wholesalePrice),
          wholesaleMinQty: Number(wholesaleMinQty),
          stockQty: Number(stockQty),
          minStockAlert: Number(minStockAlert),
          status,
        },
      },
    });
    if (result?.updateProduct) {
      router.push("/products");
    }
  }

  if (loadingRefs || loadingProduct) return <LoadingState />;

  if (!productData?.product) {
    return (
      <div className="p-8">
        <EmptyState title="ບໍ່ພົບສິນຄ້ານີ້" />
      </div>
    );
  }

  const categories = refData?.categories ?? [];
  const units = refData?.units ?? [];

  return (
    <div className="flex min-h-screen flex-col p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">ແກ້ໄຂສິນຄ້າ</h1>
        <p className="mt-1 text-sm text-text-secondary">{productData.product.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="flex flex-col gap-6 p-6 lg:flex-row">
          <ImageUpload value={imageUrl} onChange={setImageUrl} />

          <div className="flex flex-1 flex-col gap-6">
            <div className="flex flex-col gap-4">
              <SectionLabel>ຂໍ້ມູນທົ່ວໄປ</SectionLabel>
              <Input
                label="ຊື່ສິນຄ້າ"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <CreatableSelect
                  label="ໝວດໝູ່"
                  value={categoryId}
                  onChange={setCategoryId}
                  options={categories}
                  placeholder="ເລືອກໝວດໝູ່"
                  onCreate={async (newCatName) => {
                    const { data: res } = await createCategory({
                      variables: { input: { name: newCatName } },
                    });
                    if (!res?.createCategory) throw new Error("ບໍ່ສາມາດເພີ່ມໝວດໝູ່ໄດ້");
                    await refetchRefs();
                    return res.createCategory;
                  }}
                />
                <CreatableSelect
                  label="ຫົວໜ່ວຍ"
                  value={unitId}
                  onChange={setUnitId}
                  options={units}
                  placeholder="ເລືອກຫົວໜ່ວຍ"
                  onCreate={async (newUnitName) => {
                    const { data: res } = await createUnit({
                      variables: { input: { name: newUnitName } },
                    });
                    if (!res?.createUnit) throw new Error("ບໍ່ສາມາດເພີ່ມຫົວໜ່ວຍໄດ້");
                    await refetchRefs();
                    return res.createUnit;
                  }}
                />
                <Input
                  label="Barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="ບໍ່ບັງຄັບ"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">ສະຖານະ</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-11 w-full rounded-control border border-border bg-surface px-3.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 sm:max-w-64"
                >
                  <option value="ACTIVE">ເປີດ</option>
                  <option value="DISCONTINUED">ປິດ</option>
                </select>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex flex-col gap-4">
              <SectionLabel>ລາຄາ</SectionLabel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <NumberInput
                  label="ລາຄາຕົ້ນທຶນ"
                  value={costPrice}
                  onChange={setCostPrice}
                  required
                />
                <NumberInput
                  label="ລາຄາຍ່ອຍ"
                  value={retailPrice}
                  onChange={setRetailPrice}
                  required
                />
                <NumberInput
                  label="ລາຄາສົ່ງ"
                  value={wholesalePrice}
                  onChange={setWholesalePrice}
                  required
                />
              </div>
              <NumberInput
                label="ຊື້ຍົກຢ່າງໜ້ອຍ (ຫົວໜ່ວຍ) ຈຶ່ງໄດ້ລາຄາສົ່ງ"
                value={wholesaleMinQty}
                onChange={setWholesaleMinQty}
                required
                className="sm:max-w-64"
              />
            </div>

            <div className="h-px bg-border" />

            <div className="flex flex-col gap-4">
              <SectionLabel>ສະຕັອກ</SectionLabel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <NumberInput
                  label="ຈຳນວນ"
                  value={stockQty}
                  onChange={setStockQty}
                  required
                />
                <NumberInput
                  label="ເຕືອນເມື່ອເຫຼືອ"
                  value={minStockAlert}
                  onChange={setMinStockAlert}
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {error.message}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກການປ່ຽນແປງ"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/products")}>
            ຍົກເລີກ
          </Button>
        </div>
      </form>
    </div>
  );
}
