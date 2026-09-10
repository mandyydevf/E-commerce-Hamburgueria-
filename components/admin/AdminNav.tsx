"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag } from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";

const ITENS_NAV = [
  { href: "/admin", label: "Painel", icone: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icone: ShoppingBag },
  { href: "/admin/produtos", label: "Produtos", icone: Package },
];

export default function AdminNav() {
  const pathname = usePathname();

  if (pathname === "/admin/login") return null;

  return (
    <div className="border-b border-line bg-surface sm:fixed sm:inset-y-0 sm:left-0 sm:z-30 sm:w-56 sm:border-b-0 sm:border-r">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:mx-0 sm:h-full sm:max-w-none sm:flex-col sm:items-stretch sm:justify-start sm:px-4 sm:py-6">
        <Link href="/admin" className="text-lg font-extrabold tracking-tight text-ink">
          VERO STORE
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto sm:mt-8 sm:flex-1 sm:flex-col sm:items-stretch sm:gap-1 sm:overflow-visible">
          {ITENS_NAV.map((item) => {
            const ativo = pathname === item.href;
            const Icone = item.icone;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-shrink-0 items-center gap-2 px-3 py-2 text-sm font-bold transition ${
                  ativo ? "bg-ink text-bg" : "text-inkSoft hover:bg-line/50 hover:text-ink"
                }`}
              >
                <Icone size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <LogoutButton />
      </div>
    </div>
  );
}
