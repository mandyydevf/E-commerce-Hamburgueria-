"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";

const ITENS_NAV = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/produtos", label: "Cardápio" },
];

export default function AdminNav() {
  const pathname = usePathname();

  if (pathname === "/admin/login") return null;

  return (
    <div className="border-b-2 border-paperLine/50 bg-white px-6 sm:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between py-4">
        <div className="flex items-center gap-1">
          {ITENS_NAV.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm font-bold uppercase tracking-wide transition ${
                  ativo
                    ? "bg-ink text-white"
                    : "text-ink/60 hover:bg-ink/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
