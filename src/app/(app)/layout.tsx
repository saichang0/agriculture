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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
      {/* Desktop/tablet sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          userLabel={userLabel}
        />
      </div>

      {/* Mobile: off-canvas sidebar, opened via the top bar icon */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-1000 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex h-full">
            <Sidebar
              collapsed={false}
              onToggleCollapse={() => setMobileSidebarOpen(false)}
              userLabel={userLabel}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="ເປີດເມນູ"
            className="flex h-9 w-9 items-center justify-center rounded-control text-text-secondary transition-colors hover:bg-surface-muted"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-text-primary">ຮ້ານອຸປະກອນ</span>
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
