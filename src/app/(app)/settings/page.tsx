import { EmptyState } from "@/components/ui/EmptyState";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col p-8">
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">ຕັ້ງຄ່າ</h1>
      <EmptyState
        title="ໜ້ານີ້ກຳລັງພັດທະນາ"
        description="ໝວດໝູ່, ໜ່ວຍນັບ, ແລະ ຜູ້ໃຊ້ ຈະຢູ່ບ່ອນນີ້"
      />
    </div>
  );
}
