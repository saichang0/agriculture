"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  PRODUCTS_PAGE_DATA,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  CREATE_UNIT,
  UPDATE_UNIT,
  DELETE_UNIT,
} from "@/lib/products-queries";
import { USERS_DATA, CREATE_USER, UPDATE_USER, DELETE_USER } from "@/lib/users-queries";
import { ME } from "@/lib/queries";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { NamedListManager } from "@/components/settings/NamedListManager";
import { UserManager } from "@/components/settings/UserManager";

const TABS = [
  { key: "categories", label: "ຈັດການປະເພດ" },
  { key: "units", label: "ຈັດການຫົວໜ່ວຍ" },
  { key: "users", label: "ຈັດການຜູ້ໃຊ້" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("categories");
  const [toast, setToast] = useState<string | null>(null);

  function notify(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  const { data: productsData, loading: loadingProducts, error: productsError } = useQuery(
    PRODUCTS_PAGE_DATA
  );
  const { data: usersData, loading: loadingUsers, error: usersError } = useQuery(USERS_DATA);
  const { data: meData } = useQuery(ME);

  const [createCategory] = useMutation(CREATE_CATEGORY, { refetchQueries: [{ query: PRODUCTS_PAGE_DATA }] });
  const [updateCategory] = useMutation(UPDATE_CATEGORY, { refetchQueries: [{ query: PRODUCTS_PAGE_DATA }] });
  const [deleteCategory] = useMutation(DELETE_CATEGORY, { refetchQueries: [{ query: PRODUCTS_PAGE_DATA }] });

  const [createUnit] = useMutation(CREATE_UNIT, { refetchQueries: [{ query: PRODUCTS_PAGE_DATA }] });
  const [updateUnit] = useMutation(UPDATE_UNIT, { refetchQueries: [{ query: PRODUCTS_PAGE_DATA }] });
  const [deleteUnit] = useMutation(DELETE_UNIT, { refetchQueries: [{ query: PRODUCTS_PAGE_DATA }] });

  const [createUser] = useMutation(CREATE_USER, { refetchQueries: [{ query: USERS_DATA }] });
  const [updateUser] = useMutation(UPDATE_USER, { refetchQueries: [{ query: USERS_DATA }] });
  const [deleteUser] = useMutation(DELETE_USER, { refetchQueries: [{ query: USERS_DATA }] });

  const categoryUsage = useMemo(() => {
    const map = new Map<string, number>();
    (productsData?.products ?? []).forEach((p) => {
      map.set(p.categoryId, (map.get(p.categoryId) ?? 0) + 1);
    });
    return map;
  }, [productsData]);

  const unitUsage = useMemo(() => {
    const map = new Map<string, number>();
    (productsData?.products ?? []).forEach((p) => {
      map.set(p.unitId, (map.get(p.unitId) ?? 0) + 1);
      p.packagingUnits.forEach((pu) => {
        map.set(pu.unitId, (map.get(pu.unitId) ?? 0) + 1);
      });
    });
    return map;
  }, [productsData]);

  const loading =
    tab === "users" ? loadingUsers && !usersData : loadingProducts && !productsData;

  if (loading) return <LoadingState />;

  const error = tab === "users" ? usersError : productsError;
  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState title="ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້" description={error.message} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">ຕັ້ງຄ່າ</h1>
        <p className="mt-1 text-sm text-text-secondary">
          ຈັດການປະເພດສິນຄ້າ ຫົວໜ່ວຍ ແລະ ຜູ້ໃຊ້ຂອງລະບົບ
        </p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-b-2 border-primary text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "categories" && (
        <NamedListManager
          title="ຈັດການປະເພດສິນຄ້າ"
          description="ເພີ່ມ ແກ້ໄຂ ຫຼື ລຶບປະເພດສິນຄ້າ"
          addLabel="ເພີ່ມປະເພດ"
          namePlaceholder="ຊື່ປະເພດໃໝ່..."
          items={productsData?.categories ?? []}
          usageCountById={categoryUsage}
          onCreate={async (name) => {
            const { data } = await createCategory({ variables: { input: { name } } });
            if (!data?.createCategory) throw new Error("ບໍ່ສາມາດເພີ່ມປະເພດໄດ້");
            notify(`ເພີ່ມ "${name}" ແລ້ວ`);
          }}
          onRename={async (id, name) => {
            const { data } = await updateCategory({ variables: { id, input: { name } } });
            if (!data?.updateCategory) throw new Error("ບໍ່ສາມາດແກ້ໄຂໄດ້");
            notify("ບັນທຶກແລ້ວ");
          }}
          onDelete={async (id) => {
            await deleteCategory({ variables: { id } });
            notify("ລຶບແລ້ວ");
          }}
        />
      )}

      {tab === "units" && (
        <NamedListManager
          title="ຈັດການຫົວໜ່ວຍ"
          description="ເພີ່ມ ແກ້ໄຂ ຫຼື ລຶບຫົວໜ່ວຍນັບສິນຄ້າ"
          addLabel="ເພີ່ມຫົວໜ່ວຍ"
          namePlaceholder="ຊື່ຫົວໜ່ວຍໃໝ່..."
          items={productsData?.units ?? []}
          usageCountById={unitUsage}
          onCreate={async (name) => {
            const { data } = await createUnit({ variables: { input: { name } } });
            if (!data?.createUnit) throw new Error("ບໍ່ສາມາດເພີ່ມຫົວໜ່ວຍໄດ້");
            notify(`ເພີ່ມ "${name}" ແລ້ວ`);
          }}
          onRename={async (id, name) => {
            const { data } = await updateUnit({ variables: { id, input: { name } } });
            if (!data?.updateUnit) throw new Error("ບໍ່ສາມາດແກ້ໄຂໄດ້");
            notify("ບັນທຶກແລ້ວ");
          }}
          onDelete={async (id) => {
            await deleteUnit({ variables: { id } });
            notify("ລຶບແລ້ວ");
          }}
        />
      )}

      {tab === "users" && (
        <UserManager
          users={usersData?.users ?? []}
          currentUserId={meData?.me?.id ?? null}
          onCreate={async (input) => {
            const { data } = await createUser({ variables: { input } });
            if (!data?.createUser) throw new Error("ບໍ່ສາມາດເພີ່ມຜູ້ໃຊ້ໄດ້");
            notify(`ເພີ່ມຜູ້ໃຊ້ "${input.firstName} ${input.lastName}" ແລ້ວ`);
          }}
          onUpdate={async (id, input) => {
            const { data } = await updateUser({ variables: { id, input } });
            if (!data?.updateUser) throw new Error("ບໍ່ສາມາດແກ້ໄຂໄດ້");
            notify("ບັນທຶກແລ້ວ");
          }}
          onDelete={async (id) => {
            await deleteUser({ variables: { id } });
            notify("ລຶບແລ້ວ");
          }}
        />
      )}

      {toast && <Toast message={toast} tone="success" />}
    </div>
  );
}
