"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  LayoutDashboard,
  Network,
  Menu,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

const nav = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/systems/07.14", label: "SCE 07.14", icon: Network },
  { href: "/#trenes", label: "Dependencias", icon: Activity },
  { href: "/#alertas", label: "Alertas", icon: AlertTriangle },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center gap-3 border-b border-surface-border px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
          <Network className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">IntegraCom Hub</p>
          <p className="text-xs text-slate-500">Gerencia · Demo v0.2</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : item.href.startsWith("/systems")
                ? pathname.startsWith("/systems")
                : false;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-accent/20 text-white"
                  : "text-slate-400 hover:bg-surface-raised hover:text-slate-200",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-border p-4 text-xs text-slate-600">
        <p>20 sistemas · Fichas técnicas (fase 2)</p>
        <p>Valorización (fase 3)</p>
      </div>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-surface-border bg-[#0a0e14] lg:flex">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          />
          <aside className="relative flex h-full w-64 flex-col bg-[#0a0e14] shadow-xl">
            <button
              type="button"
              className="absolute right-3 top-4 text-slate-400"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col lg:ml-64">
        <div className="sticky top-0 z-30 flex items-center border-b border-surface-border bg-[#0a0e14]/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-surface-raised"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm font-semibold text-white">
            IntegraCom Hub
          </span>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
