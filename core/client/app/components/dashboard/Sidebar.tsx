"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Newspaper,
  LayoutGrid,
  BarChart3,
  Bot,
  Contact2,
  Users,
  UserCog,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";
import type { CurrentUser } from "@/app/lib/auth";
import LogoutButton from "@/app/components/dashboard/LogoutButton";

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "General",
    items: [
      { label: "Inicio", href: "/dashboard", icon: Home },
      { label: "Blog", href: "/dashboard/blog", icon: Newspaper },
      { label: "Contenido", href: "/dashboard/contenido", icon: LayoutGrid },
      { label: "Clientes", href: "/dashboard/clientes", icon: Contact2, adminOnly: true },
      { label: "Test", href: "/dashboard/test", icon: ClipboardList, adminOnly: true },
      { label: "Analíticas", href: "/dashboard/analiticas", icon: BarChart3 },
      { label: "Automatización IA", href: "/dashboard/automatizacion-ia", icon: Bot },
    ],
  },
  {
    label: "Administración",
    items: [{ label: "Usuarios", href: "/dashboard/usuarios", icon: Users, adminOnly: true }],
  },
  {
    label: "Cuenta",
    items: [{ label: "Mi cuenta", href: "/dashboard/cuenta", icon: UserCog }],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

interface SidebarProps {
  user: CurrentUser;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.adminOnly || user.role === "Admin"),
  })).filter((group) => group.items.length > 0);

  const brand = (
    <span className="font-heading text-lg font-bold text-ink">
      <span className="text-brand">IB</span>OUTPLACEMENT
    </span>
  );

  const navLinks = (
    <nav className="flex flex-1 flex-col gap-5 px-3">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-ink/35 uppercase">
            {group.label}
          </p>
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-ink text-white" : "text-ink/60 hover:bg-black/5 hover:text-ink"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-black/10 p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
          {initials(user.fullName)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{user.fullName}</p>
          <p className="truncate text-xs text-ink/40">{user.role}</p>
        </div>
      </div>
      <LogoutButton />
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 lg:hidden">
        {brand}
        <button type="button" aria-label="Abrir menú" onClick={() => setOpen(true)} className="text-ink">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-full w-72 max-w-[80vw] flex-col bg-white pt-6 shadow-xl">
            <div className="flex items-center justify-between px-4">
              {brand}
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
                className="text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 flex flex-1 flex-col">
              {navLinks}
              {footer}
            </div>
          </div>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-black/10 bg-white lg:flex">
        <div className="px-5 py-6">{brand}</div>
        {navLinks}
        {footer}
      </aside>
    </>
  );
}
