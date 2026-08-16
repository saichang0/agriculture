"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { ME } from "@/lib/queries";
import { getToken } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { LoadingState } from "@/components/ui/Spinner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { data, loading } = useQuery(ME, { skip: !getToken() });

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    if (!loading && !data?.me) {
      router.replace("/login");
    }
  }, [loading, data, router]);

  if (!getToken() || loading) {
    return <LoadingState />;
  }

  if (!data?.me) {
    return null;
  }

  const userLabel = `${data.me.firstName} ${data.me.lastName}`;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        userLabel={userLabel}
      />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
