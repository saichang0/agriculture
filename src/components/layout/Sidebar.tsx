"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { clearToken, getRefreshToken } from "@/lib/auth";
import { LOGOUT } from "@/lib/queries";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

function IconSales() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.87-4.575 2.235-6.75H5.106M7.5 14.25 5.106 5.272M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}

function IconProducts() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5 12 3 3.75 7.5m16.5 0v9L12 21m8.25-13.5L12 12m0 9-8.25-4.5v-9M12 12 3.75 7.5" />
    </svg>
  );
}

function IconCustomers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function IconReports() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.752.43.992l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.752-.43-.992l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.281Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      stroke="currentColor"
      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function IconCollapse({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.8"
      stroke="currentColor"
      className={`h-5 w-5 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14-7-7 7-7" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { label: "ຂາຍ", href: "/sales", icon: <IconSales /> },
  { label: "ສິນຄ້າ", href: "/products", icon: <IconProducts /> },
  { label: "ລູກຄ້າ & ໜີ້ຄ້າງ", href: "/customers", icon: <IconCustomers /> },
  {
    label: "ລາຍງານ",
    href: "/reports",
    icon: <IconReports />,
    children: [
      { label: "ພາບລວມ", href: "/reports" },
      { label: "ຍອດຂາຍ", href: "/reports/sales" },
      { label: "ປະຫວັດການຂາຍ", href: "/reports/history" },
      { label: "ສິນຄ້າເສຍຫາຍ", href: "/reports/damaged" },
      { label: "ລາຍຮັບ-ລາຍຈ່າຍ", href: "/reports/expenses" },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  userLabel?: string;
}

export function Sidebar({ collapsed, onToggleCollapse, userLabel }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [reportsOpen, setReportsOpen] = useState(pathname.startsWith("/reports"));
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [logout] = useMutation(LOGOUT);

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  }

  async function handleLogout() {
    const refreshToken = getRefreshToken();
    clearToken();
    router.push("/login");
    // Best-effort: revoke server-side so the refresh token can't outlive this
    // logout. Runs after navigating away so the user isn't blocked on it.
    if (refreshToken) {
      try {
        await logout({ variables: { refreshToken } });
      } catch {
        // Already logged out locally — nothing more to do if this fails.
      }
    }
  }

  return (
    <aside
      className={`sticky top-0 flex h-screen flex-col overflow-visible border-r border-sidebar-border bg-sidebar-bg text-sidebar-text transition-[width] duration-200 ease-out ${
        collapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="mt-3 flex w-full items-center justify-start rounded-control py-2 text-sidebar-text transition-colors hover:text-sidebar-text-active cursor-pointer"
          aria-label={collapsed ? "ຂະຫຍາຍເມນູ" : "ຫຍໍ້ເມນູ"}
        >
          <IconCollapse collapsed={collapsed} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            if (item.children) {
              return (
                <li key={item.href} className="group/nav relative">
                  <button
                    type="button"
                    onClick={() => (collapsed ? undefined : setReportsOpen((v) => !v))}
                    className={`flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-sidebar-bg-active text-sidebar-text-active"
                        : "text-sidebar-text hover:bg-sidebar-bg-hover hover:text-sidebar-text-active"
                    }`}
                  >
                    {item.icon}
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <IconChevron open={reportsOpen} />
                      </>
                    )}
                  </button>

                  {!collapsed && reportsOpen && (
                    <ul className="mt-1 flex flex-col gap-0.5 border-l border-sidebar-border pl-4">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={`block rounded-control px-3 py-2 text-sm transition-colors ${
                                childActive
                                  ? "bg-sidebar-bg-active text-sidebar-text-active"
                                  : "text-sidebar-text hover:bg-sidebar-bg-hover hover:text-sidebar-text-active"
                              }`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* Flyout submenu when collapsed */}
                  {collapsed && (
                    <div className="invisible absolute left-full top-0 z-50 ml-2 min-w-48 rounded-control border border-sidebar-border bg-sidebar-bg py-2 opacity-0 shadow-lg transition-[opacity,visibility] duration-150 group-hover/nav:visible group-hover/nav:opacity-100">
                      <div className="px-3 pb-2 text-xs font-semibold text-sidebar-text/60">
                        {item.label}
                      </div>
                      <ul className="flex flex-col gap-0.5 px-1">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={`block rounded-control px-3 py-2 text-sm transition-colors ${
                                  childActive
                                    ? "bg-sidebar-bg-active text-sidebar-text-active"
                                    : "text-sidebar-text hover:bg-sidebar-bg-hover hover:text-sidebar-text-active"
                                }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            }

            return (
              <li key={item.href} className="group/nav relative">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-sidebar-bg-active text-sidebar-text-active"
                      : "text-sidebar-text hover:bg-sidebar-bg-hover hover:text-sidebar-text-active"
                  }`}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </Link>

                {collapsed && (
                  <div className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-control border border-sidebar-border bg-sidebar-bg px-3 py-2 text-sm text-sidebar-text-active opacity-0 shadow-lg transition-[opacity,visibility] duration-150 group-hover/nav:visible group-hover/nav:opacity-100">
                    {item.label}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: settings, logout, collapse toggle */}
      <div className="border-t border-sidebar-border px-3 py-4">
        {userLabel && !collapsed && (
          <div className="mb-2 truncate px-3 text-xs text-sidebar-text/70">{userLabel}</div>
        )}

        <ul className="flex flex-col gap-1">
          <li>
            <Link
              href="/settings"
              className={`flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive("/settings")
                  ? "bg-sidebar-bg-active text-sidebar-text-active"
                  : "text-sidebar-text hover:bg-sidebar-bg-hover hover:text-sidebar-text-active"
              }`}
              title={collapsed ? "ຕັ້ງຄ່າ" : undefined}
            >
              <IconSettings />
              {!collapsed && <span>ຕັ້ງຄ່າ</span>}
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium text-sidebar-text transition-colors hover:bg-danger/15 hover:text-danger"
              title={collapsed ? "ອອກຈາກລະບົບ" : undefined}
            >
              <IconLogout />
              {!collapsed && <span>ອອກຈາກລະບົບ</span>}
            </button>
          </li>
        </ul>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="ອອກຈາກລະບົບ"
        description="ທ່ານຕ້ອງການອອກຈາກລະບົບແທ້ບໍ່?"
        confirmLabel="ອອກຈາກລະບົບ"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </aside>
  );
}
